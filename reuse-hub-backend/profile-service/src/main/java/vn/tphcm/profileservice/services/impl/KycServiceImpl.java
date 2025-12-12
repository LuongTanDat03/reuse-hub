package vn.tphcm.profileservice.services.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.commons.KycStatus;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.request.KycReviewRequest;
import vn.tphcm.profileservice.dtos.request.KycSubmitRequest;
import vn.tphcm.profileservice.dtos.response.KycResponse;
import vn.tphcm.profileservice.exceptions.AppException;
import vn.tphcm.profileservice.exceptions.ErrorCode;
import vn.tphcm.profileservice.mapper.KycMapper;
import vn.tphcm.profileservice.models.KycVerification;
import vn.tphcm.profileservice.repositories.KycRepository;
import vn.tphcm.profileservice.services.KycService;
import vn.tphcm.profileservice.services.SupabaseStorageService;

import vn.tphcm.profileservice.dtos.response.ImageUploadResponse;
import vn.tphcm.profileservice.utils.KycValidator;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "KYC-SERVICE")
public class KycServiceImpl implements KycService {

    private final KycRepository kycRepository;
    private final KycMapper kycMapper;
    private final SupabaseStorageService storageService;

    @Override
    @Transactional
    public ApiResponse<KycResponse> submitKyc(String userId, KycSubmitRequest request,
                                               MultipartFile frontImage,
                                               MultipartFile backImage,
                                               MultipartFile selfieImage) {
        log.info("Submitting KYC for user: {}", userId);

        // Validate request and images
        KycValidator.validateKycRequest(request, frontImage, backImage, selfieImage);

        // Check if user already has pending or approved KYC
        List<KycStatus> activeStatuses = Arrays.asList(KycStatus.PENDING, KycStatus.UNDER_REVIEW, KycStatus.APPROVED);
        if (kycRepository.existsByUserIdAndStatusIn(userId, activeStatuses)) {
            throw new AppException(ErrorCode.KYC_ALREADY_EXISTS);
        }

        // Check if document number is already used by another user
        kycRepository.findByDocumentNumberAndUserIdNot(request.getDocumentNumber(), userId)
                .ifPresent(k -> {
                    throw new AppException(ErrorCode.DOCUMENT_ALREADY_USED);
                });

        // Upload images
        String frontImageUrl = uploadImage(frontImage, userId, "front");
        String backImageUrl = backImage != null && !backImage.isEmpty() 
                ? uploadImage(backImage, userId, "back") : null;
        String selfieImageUrl = selfieImage != null && !selfieImage.isEmpty() 
                ? uploadImage(selfieImage, userId, "selfie") : null;

        // Create KYC entity
        KycVerification kyc = kycMapper.toEntity(request);
        kyc.setUserId(userId);
        kyc.setFrontImageUrl(frontImageUrl);
        kyc.setBackImageUrl(backImageUrl);
        kyc.setSelfieImageUrl(selfieImageUrl);
        kyc.setStatus(KycStatus.PENDING);
        kyc.setSubmittedAt(LocalDateTime.now());

        kyc = kycRepository.save(kyc);
        log.info("KYC submitted successfully for user: {}", userId);

        return ApiResponse.<KycResponse>builder()
                .status(201)
                .message("Gửi yêu cầu xác minh thành công")
                .data(kycMapper.toResponse(kyc))
                .build();
    }

    @Override
    public ApiResponse<KycResponse> getMyKyc(String userId) {
        log.info("Getting KYC for user: {}", userId);

        KycVerification kyc = kycRepository.findByUserId(userId)
                .orElse(null);

        if (kyc == null) {
            return ApiResponse.<KycResponse>builder()
                    .status(200)
                    .message("Chưa có thông tin xác minh")
                    .data(null)
                    .build();
        }

        return ApiResponse.<KycResponse>builder()
                .status(200)
                .message("Lấy thông tin xác minh thành công")
                .data(kycMapper.toResponse(kyc))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<KycResponse> resubmitKyc(String userId, KycSubmitRequest request,
                                                 MultipartFile frontImage,
                                                 MultipartFile backImage,
                                                 MultipartFile selfieImage) {
        log.info("Resubmitting KYC for user: {}", userId);

        // Validate request and images
        KycValidator.validateKycRequest(request, frontImage, backImage, selfieImage);

        // Find existing rejected KYC
        KycVerification existingKyc = kycRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.KYC_NOT_FOUND));

        if (existingKyc.getStatus() != KycStatus.REJECTED) {
            throw new AppException(ErrorCode.KYC_CANNOT_RESUBMIT);
        }

        // Check if document number is already used by another user
        kycRepository.findByDocumentNumberAndUserIdNot(request.getDocumentNumber(), userId)
                .ifPresent(k -> {
                    throw new AppException(ErrorCode.DOCUMENT_ALREADY_USED);
                });

        // Upload new images if provided
        if (frontImage != null && !frontImage.isEmpty()) {
            existingKyc.setFrontImageUrl(uploadImage(frontImage, userId, "front"));
        }
        if (backImage != null && !backImage.isEmpty()) {
            existingKyc.setBackImageUrl(uploadImage(backImage, userId, "back"));
        }
        if (selfieImage != null && !selfieImage.isEmpty()) {
            existingKyc.setSelfieImageUrl(uploadImage(selfieImage, userId, "selfie"));
        }

        // Update KYC info
        kycMapper.updateEntity(request, existingKyc);
        existingKyc.setStatus(KycStatus.PENDING);
        existingKyc.setRejectionReason(null);
        existingKyc.setReviewedBy(null);
        existingKyc.setReviewedAt(null);
        existingKyc.setSubmittedAt(LocalDateTime.now());

        existingKyc = kycRepository.save(existingKyc);
        log.info("KYC resubmitted successfully for user: {}", userId);

        return ApiResponse.<KycResponse>builder()
                .status(200)
                .message("Gửi lại yêu cầu xác minh thành công")
                .data(kycMapper.toResponse(existingKyc))
                .build();
    }

    @Override
    public ApiResponse<PageResponse<KycResponse>> getPendingKyc(int pageNo, int pageSize) {
        log.info("Getting pending KYC requests");

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("submittedAt").ascending());
        Page<KycVerification> page = kycRepository.findByStatus(KycStatus.PENDING, pageable);

        return ApiResponse.<PageResponse<KycResponse>>builder()
                .status(200)
                .message("Lấy danh sách KYC chờ duyệt thành công")
                .data(PageResponse.<KycResponse>builder()
                        .content(kycMapper.toResponseList(page.getContent()))
                        .pageNo(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<PageResponse<KycResponse>> getAllKyc(KycStatus status, int pageNo, int pageSize) {
        log.info("Getting all KYC requests with status: {}", status);

        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("submittedAt").descending());
        Page<KycVerification> page;

        if (status != null) {
            page = kycRepository.findByStatus(status, pageable);
        } else {
            page = kycRepository.findAll(pageable);
        }

        return ApiResponse.<PageResponse<KycResponse>>builder()
                .status(200)
                .message("Lấy danh sách KYC thành công")
                .data(PageResponse.<KycResponse>builder()
                        .content(kycMapper.toResponseList(page.getContent()))
                        .pageNo(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .last(page.isLast())
                        .build())
                .build();
    }

    @Override
    public ApiResponse<KycResponse> getKycById(String kycId) {
        log.info("Getting KYC by id: {}", kycId);

        KycVerification kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new AppException(ErrorCode.KYC_NOT_FOUND));

        return ApiResponse.<KycResponse>builder()
                .status(200)
                .message("Lấy thông tin KYC thành công")
                .data(kycMapper.toResponse(kyc))
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<KycResponse> reviewKyc(String kycId, String adminId, KycReviewRequest request) {
        log.info("Reviewing KYC: {} by admin: {}", kycId, adminId);

        KycVerification kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new AppException(ErrorCode.KYC_NOT_FOUND));

        if (kyc.getStatus() != KycStatus.PENDING && kyc.getStatus() != KycStatus.UNDER_REVIEW) {
            throw new AppException(ErrorCode.KYC_ALREADY_REVIEWED);
        }

        kyc.setStatus(request.getStatus());
        kyc.setReviewedBy(adminId);
        kyc.setReviewedAt(LocalDateTime.now());

        if (request.getStatus() == KycStatus.REJECTED) {
            kyc.setRejectionReason(request.getRejectionReason());
        } else if (request.getStatus() == KycStatus.APPROVED) {
            // Set expiry date (e.g., 1 year from now)
            kyc.setExpiresAt(LocalDateTime.now().plusYears(1));
        }

        kyc = kycRepository.save(kyc);
        log.info("KYC {} reviewed with status: {}", kycId, request.getStatus());

        String message = request.getStatus() == KycStatus.APPROVED 
                ? "Đã phê duyệt xác minh" 
                : "Đã từ chối xác minh";

        return ApiResponse.<KycResponse>builder()
                .status(200)
                .message(message)
                .data(kycMapper.toResponse(kyc))
                .build();
    }

    @Override
    public ApiResponse<Long> countPendingKyc() {
        long count = kycRepository.countByStatus(KycStatus.PENDING);
        return ApiResponse.<Long>builder()
                .status(200)
                .message("Đếm số KYC chờ duyệt thành công")
                .data(count)
                .build();
    }

    @Override
    public ApiResponse<Boolean> isUserVerified(String userId) {
        boolean verified = kycRepository.existsByUserIdAndStatusIn(userId, 
                List.of(KycStatus.APPROVED));
        return ApiResponse.<Boolean>builder()
                .status(200)
                .message(verified ? "Người dùng đã xác minh" : "Người dùng chưa xác minh")
                .data(verified)
                .build();
    }

    private String uploadImage(MultipartFile file, String userId, String type) {
        try {
            String folder = String.format("kyc/%s", userId);
            ImageUploadResponse response = storageService.uploadImage(file, folder);
            return response.getImageUrl();
        } catch (Exception e) {
            log.error("Failed to upload KYC image: {}", e.getMessage());
            throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

}

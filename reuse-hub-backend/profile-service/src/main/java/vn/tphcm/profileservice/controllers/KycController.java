package vn.tphcm.profileservice.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.commons.KycStatus;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.request.KycReviewRequest;
import vn.tphcm.profileservice.dtos.request.KycSubmitRequest;
import vn.tphcm.profileservice.dtos.response.KycResponse;
import vn.tphcm.profileservice.services.KycService;

@RestController
@RequestMapping("/profile/kyc")
@RequiredArgsConstructor
@Slf4j(topic = "KYC-CONTROLLER")
@Tag(name = "KYC", description = "KYC Verification APIs")
public class KycController {

    private final KycService kycService;

    // ==================== USER ENDPOINTS ====================

    @PostMapping("/submit/{userId}")
    @Operation(summary = "Gửi yêu cầu xác minh KYC")
    public ApiResponse<KycResponse> submitKyc(
            @PathVariable String userId,
            @RequestPart("request") @Valid KycSubmitRequest request,
            @RequestPart("frontImage") MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "selfieImage", required = false) MultipartFile selfieImage) {
        log.info("Submitting KYC for user: {}", userId);
        return kycService.submitKyc(userId, request, frontImage, backImage, selfieImage);
    }

    @GetMapping("/my/{userId}")
    @Operation(summary = "Xem thông tin KYC của tôi")
    public ApiResponse<KycResponse> getMyKyc(@PathVariable String userId) {
        log.info("Getting KYC for user: {}", userId);
        return kycService.getMyKyc(userId);
    }

    @PutMapping("/resubmit/{userId}")
    @Operation(summary = "Gửi lại yêu cầu xác minh KYC (sau khi bị từ chối)")
    public ApiResponse<KycResponse> resubmitKyc(
            @PathVariable String userId,
            @RequestPart("request") @Valid KycSubmitRequest request,
            @RequestPart(value = "frontImage", required = false) MultipartFile frontImage,
            @RequestPart(value = "backImage", required = false) MultipartFile backImage,
            @RequestPart(value = "selfieImage", required = false) MultipartFile selfieImage) {
        log.info("Resubmitting KYC for user: {}", userId);
        return kycService.resubmitKyc(userId, request, frontImage, backImage, selfieImage);
    }

    @GetMapping("/verified/{userId}")
    @Operation(summary = "Kiểm tra user đã xác minh chưa")
    public ApiResponse<Boolean> isUserVerified(@PathVariable String userId) {
        log.info("Checking if user {} is verified", userId);
        return kycService.isUserVerified(userId);
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/pending")
    @Operation(summary = "[Admin] Xem danh sách KYC chờ duyệt")
    public ApiResponse<PageResponse<KycResponse>> getPendingKyc(
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting pending KYC requests");
        return kycService.getPendingKyc(pageNo, pageSize);
    }

    @GetMapping("/admin/all")
    @Operation(summary = "[Admin] Xem tất cả KYC")
    public ApiResponse<PageResponse<KycResponse>> getAllKyc(
            @RequestParam(required = false) KycStatus status,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        log.info("Getting all KYC with status: {}", status);
        return kycService.getAllKyc(status, pageNo, pageSize);
    }

    @GetMapping("/admin/{kycId}")
    @Operation(summary = "[Admin] Xem chi tiết KYC")
    public ApiResponse<KycResponse> getKycById(@PathVariable String kycId) {
        log.info("Getting KYC by id: {}", kycId);
        return kycService.getKycById(kycId);
    }

    @PutMapping("/admin/{kycId}/review/{adminId}")
    @Operation(summary = "[Admin] Xét duyệt KYC")
    public ApiResponse<KycResponse> reviewKyc(
            @PathVariable String kycId,
            @PathVariable String adminId,
            @RequestBody @Valid KycReviewRequest request) {
        log.info("Reviewing KYC: {} by admin: {}", kycId, adminId);
        return kycService.reviewKyc(kycId, adminId, request);
    }

    @GetMapping("/admin/count/pending")
    @Operation(summary = "[Admin] Đếm số KYC chờ duyệt")
    public ApiResponse<Long> countPendingKyc() {
        return kycService.countPendingKyc();
    }
}

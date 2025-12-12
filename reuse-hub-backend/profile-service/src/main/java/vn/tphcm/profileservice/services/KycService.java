package vn.tphcm.profileservice.services;

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.commons.KycStatus;
import vn.tphcm.profileservice.dtos.ApiResponse;
import vn.tphcm.profileservice.dtos.PageResponse;
import vn.tphcm.profileservice.dtos.request.KycReviewRequest;
import vn.tphcm.profileservice.dtos.request.KycSubmitRequest;
import vn.tphcm.profileservice.dtos.response.KycResponse;

public interface KycService {

    // User endpoints
    ApiResponse<KycResponse> submitKyc(String userId, KycSubmitRequest request,
                                        MultipartFile frontImage,
                                        MultipartFile backImage,
                                        MultipartFile selfieImage);

    ApiResponse<KycResponse> getMyKyc(String userId);

    ApiResponse<KycResponse> resubmitKyc(String userId, KycSubmitRequest request,
                                          MultipartFile frontImage,
                                          MultipartFile backImage,
                                          MultipartFile selfieImage);

    // Admin endpoints
    ApiResponse<PageResponse<KycResponse>> getPendingKyc(int pageNo, int pageSize);

    ApiResponse<PageResponse<KycResponse>> getAllKyc(KycStatus status, int pageNo, int pageSize);

    ApiResponse<KycResponse> getKycById(String kycId);

    ApiResponse<KycResponse> reviewKyc(String kycId, String adminId, KycReviewRequest request);

    ApiResponse<Long> countPendingKyc();

    ApiResponse<Boolean> isUserVerified(String userId);
}

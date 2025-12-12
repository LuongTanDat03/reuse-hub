package vn.tphcm.profileservice.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // KYC Errors
    KYC_NOT_FOUND(404, "Không tìm thấy thông tin xác minh", HttpStatus.NOT_FOUND),
    KYC_ALREADY_EXISTS(409, "Bạn đã có yêu cầu xác minh đang chờ xử lý hoặc đã được phê duyệt", HttpStatus.CONFLICT),
    KYC_CANNOT_RESUBMIT(400, "Chỉ có thể gửi lại khi yêu cầu bị từ chối", HttpStatus.BAD_REQUEST),
    KYC_ALREADY_REVIEWED(400, "Yêu cầu xác minh đã được xử lý", HttpStatus.BAD_REQUEST),
    DOCUMENT_ALREADY_USED(409, "Số giấy tờ này đã được sử dụng bởi tài khoản khác", HttpStatus.CONFLICT),
    FRONT_IMAGE_REQUIRED(400, "Ảnh mặt trước giấy tờ là bắt buộc", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED(500, "Tải ảnh lên thất bại", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // General Errors
    UNCATEGORIZED(500, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(400, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}

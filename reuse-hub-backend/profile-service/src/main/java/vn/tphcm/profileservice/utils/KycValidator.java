package vn.tphcm.profileservice.utils;

import org.springframework.web.multipart.MultipartFile;
import vn.tphcm.profileservice.commons.DocumentType;
import vn.tphcm.profileservice.dtos.request.KycSubmitRequest;
import vn.tphcm.profileservice.exceptions.AppException;
import vn.tphcm.profileservice.exceptions.ErrorCode;

import java.util.regex.Pattern;

public class KycValidator {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String[] ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"};

    // Document number patterns
    private static final Pattern CCCD_PATTERN = Pattern.compile("^\\d{12}$"); // 12 digits
    private static final Pattern CMND_PATTERN = Pattern.compile("^\\d{9}$"); // 9 digits
    private static final Pattern PASSPORT_PATTERN = Pattern.compile("^[A-Z]{1,2}\\d{6,9}$"); // Letter + 6-9 digits
    private static final Pattern DRIVER_LICENSE_PATTERN = Pattern.compile("^[A-Z0-9]{6,12}$"); // 6-12 alphanumeric

    public static void validateKycRequest(KycSubmitRequest request, 
                                          MultipartFile frontImage,
                                          MultipartFile backImage,
                                          MultipartFile selfieImage) {
        // Validate document number
        validateDocumentNumber(request.getDocumentType(), request.getDocumentNumber());

        // Validate full name
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Họ tên không được để trống");
        }

        if (request.getFullName().length() < 3 || request.getFullName().length() > 255) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Họ tên phải từ 3-255 ký tự");
        }

        // Validate images
        validateImage(frontImage, "Ảnh mặt trước");
        if (backImage != null && !backImage.isEmpty()) {
            validateImage(backImage, "Ảnh mặt sau");
        }
        if (selfieImage != null && !selfieImage.isEmpty()) {
            validateImage(selfieImage, "Ảnh selfie");
        }
    }

    private static void validateDocumentNumber(DocumentType type, String documentNumber) {
        if (documentNumber == null || documentNumber.trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Số giấy tờ không được để trống");
        }

        documentNumber = documentNumber.trim().toUpperCase();

        switch (type) {
            case CCCD:
                if (!CCCD_PATTERN.matcher(documentNumber).matches()) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, 
                            "CCCD phải gồm 12 chữ số (ví dụ: 123456789012)");
                }
                break;
            case CMND:
                if (!CMND_PATTERN.matcher(documentNumber).matches()) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, 
                            "CMND phải gồm 9 chữ số (ví dụ: 123456789)");
                }
                break;
            case PASSPORT:
                if (!PASSPORT_PATTERN.matcher(documentNumber).matches()) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, 
                            "Hộ chiếu phải bắt đầu bằng 1-2 chữ cái theo sau là 6-9 chữ số (ví dụ: AB123456)");
                }
                break;
            case DRIVER_LICENSE:
                if (!DRIVER_LICENSE_PATTERN.matcher(documentNumber).matches()) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, 
                            "Bằng lái xe phải gồm 6-12 ký tự chữ và số (ví dụ: DL123456)");
                }
                break;
        }
    }

    private static void validateImage(MultipartFile file, String fieldName) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FRONT_IMAGE_REQUIRED, fieldName + " là bắt buộc");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                    fieldName + " không được vượt quá 5MB (hiện tại: " + formatFileSize(file.getSize()) + ")");
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedMimeType(contentType)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                    fieldName + " phải là ảnh (JPEG, PNG hoặc WebP)");
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename == null || !isAllowedExtension(filename)) {
            throw new AppException(ErrorCode.INVALID_REQUEST, 
                    fieldName + " phải có đuôi .jpg, .jpeg, .png hoặc .webp");
        }
    }

    private static boolean isAllowedMimeType(String mimeType) {
        for (String allowed : ALLOWED_MIME_TYPES) {
            if (mimeType.equalsIgnoreCase(allowed)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isAllowedExtension(String filename) {
        String lower = filename.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || 
               lower.endsWith(".png") || lower.endsWith(".webp");
    }

    private static String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.1f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }
}

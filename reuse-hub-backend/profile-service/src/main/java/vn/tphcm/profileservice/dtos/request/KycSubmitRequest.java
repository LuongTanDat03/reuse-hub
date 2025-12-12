package vn.tphcm.profileservice.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import vn.tphcm.profileservice.commons.DocumentType;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycSubmitRequest {

    @NotNull(message = "Loại giấy tờ không được để trống")
    private DocumentType documentType;

    @NotBlank(message = "Số giấy tờ không được để trống")
    private String documentNumber;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    private LocalDate dateOfBirth;

    private String address;
}

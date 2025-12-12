package vn.tphcm.profileservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import vn.tphcm.profileservice.dtos.request.KycSubmitRequest;
import vn.tphcm.profileservice.dtos.response.KycResponse;
import vn.tphcm.profileservice.models.KycVerification;

import java.util.List;

@Mapper(componentModel = "spring")
public interface KycMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "frontImageUrl", ignore = true)
    @Mapping(target = "backImageUrl", ignore = true)
    @Mapping(target = "selfieImageUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "expiresAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    KycVerification toEntity(KycSubmitRequest request);

    KycResponse toResponse(KycVerification entity);

    List<KycResponse> toResponseList(List<KycVerification> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "frontImageUrl", ignore = true)
    @Mapping(target = "backImageUrl", ignore = true)
    @Mapping(target = "selfieImageUrl", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "expiresAt", ignore = true)
    @Mapping(target = "submittedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(KycSubmitRequest request, @MappingTarget KycVerification entity);
}

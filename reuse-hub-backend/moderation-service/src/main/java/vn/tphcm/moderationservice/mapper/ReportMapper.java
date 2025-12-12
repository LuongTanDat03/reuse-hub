package vn.tphcm.moderationservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import vn.tphcm.moderationservice.dtos.request.CreateReportRequest;
import vn.tphcm.moderationservice.dtos.response.ReportResponse;
import vn.tphcm.moderationservice.models.Report;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReportMapper {

    @Mapping(target = "reporterId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "reviewerId", ignore = true)
    @Mapping(target = "reviewedAt", ignore = true)
    @Mapping(target = "actionTaken", ignore = true)
    @Mapping(target = "adminNote", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    Report toEntity(CreateReportRequest request);

    ReportResponse toResponse(Report report);

    List<ReportResponse> toResponseList(List<Report> reports);
}

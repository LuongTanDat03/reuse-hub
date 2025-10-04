/*
 * @ (#) ItemMapper.java       1.0     9/18/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.itemservice.mapper;

/*
 * @author: Luong Tan Dat
 * @date: 9/18/2025
 */

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.mapstruct.*;
import vn.tphcm.itemservice.dtos.request.ItemCreationRequest;
import vn.tphcm.itemservice.dtos.request.ItemUpdateRequest;
import vn.tphcm.itemservice.dtos.request.LocationRequest;
import vn.tphcm.itemservice.dtos.response.ItemResponse;
import vn.tphcm.itemservice.dtos.response.ItemSummaryResponse;
import vn.tphcm.itemservice.dtos.response.LocationResponse;
import vn.tphcm.itemservice.models.Item;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ItemMapper {
    GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "itemInteractions", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "location", source = "locationRequest", qualifiedByName = "locationRequestToPoint")
    Item toItem(ItemCreationRequest request);

    @Mapping(target = "location", source = "location", qualifiedByName = "pointToLocationResponse")
    ItemResponse toResponse(Item item);

    ItemSummaryResponse toSummaryResponse(Item item);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "commentCount", ignore = true)
    @Mapping(target = "likeCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "location", source = "location", qualifiedByName = "locationRequestToPoint")
    void updateItem(@MappingTarget Item item, ItemUpdateRequest request);

    @Named("locationRequestToPoint")
    default Point locationRequestToPoint(LocationRequest request){
        if (request == null || request.getLatitude() == null || request.getLongitude() == null) {
            return null;
        }

        return geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
    }

    @Named("pointToLocationResponse")
    default LocationResponse pointToLocationResponse(Point point) {
        if (point == null) {
            return null;
        }
        return LocationResponse.builder()
                .longitude(point.getX())
                .latitude(point.getY())
                .build();
    }
}

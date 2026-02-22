package com.licksvault.backend.domain.lick;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface LickMapper {

    LickDto toDto(Lick lick);

    Lick toEntity(LickDto lickDto);

    @Mapping(target = "gpFile", conditionExpression = "java(lickDto.getGpFile() != null && lickDto.getGpFile().length > 0)")
    void updateEntityFromDto(LickDto lickDto, @MappingTarget Lick lick);
}

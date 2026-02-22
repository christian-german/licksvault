package com.licksvault.backend.domain.lick;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LickRepository extends JpaRepository<Lick, Long>, JpaSpecificationExecutor<Lick> {
}

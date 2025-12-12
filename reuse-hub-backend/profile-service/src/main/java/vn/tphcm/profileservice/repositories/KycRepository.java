package vn.tphcm.profileservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.tphcm.profileservice.commons.KycStatus;
import vn.tphcm.profileservice.models.KycVerification;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycRepository extends JpaRepository<KycVerification, String> {

    Optional<KycVerification> findByUserId(String userId);

    Optional<KycVerification> findByUserIdAndStatus(String userId, KycStatus status);

    List<KycVerification> findAllByUserId(String userId);

    Page<KycVerification> findByStatus(KycStatus status, Pageable pageable);

    Page<KycVerification> findByStatusIn(List<KycStatus> statuses, Pageable pageable);

    @Query("SELECT k FROM KycVerification k WHERE k.status = :status ORDER BY k.submittedAt ASC")
    Page<KycVerification> findPendingKyc(@Param("status") KycStatus status, Pageable pageable);

    long countByStatus(KycStatus status);

    boolean existsByUserIdAndStatusIn(String userId, List<KycStatus> statuses);

    @Query("SELECT k FROM KycVerification k WHERE k.documentNumber = :documentNumber AND k.userId != :userId")
    Optional<KycVerification> findByDocumentNumberAndUserIdNot(@Param("documentNumber") String documentNumber, @Param("userId") String userId);
}

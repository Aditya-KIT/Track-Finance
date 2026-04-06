package com.zorvyn.finance_backend.repository;

import com.zorvyn.finance_backend.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Page<Transaction> findByIsDeletedFalse(Pageable pageable);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.isDeleted = false AND t.type = :type")
    BigDecimal sumAmountByType(String type);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.isDeleted = false AND t.type = :type GROUP BY t.category")
    List<Object[]> sumAmountByCategoryAndType(String type);

    @Query("SELECT FUNCTION('MONTHNAME', t.date), SUM(t.amount) FROM Transaction t WHERE t.isDeleted = false AND YEAR(t.date) = YEAR(CURRENT_DATE) GROUP BY FUNCTION('MONTH', t.date), FUNCTION('MONTHNAME', t.date) ORDER BY FUNCTION('MONTH', t.date)")
    List<Object[]> getMonthlyTrends();

    List<Transaction> findTop5ByIsDeletedFalseOrderByDateDesc();

    // ---- Filtered queries ----

    @Query("SELECT t FROM Transaction t WHERE t.isDeleted = false " +
           "AND (:dateFrom IS NULL OR t.date >= :dateFrom) " +
           "AND (:dateTo IS NULL OR t.date <= :dateTo) " +
           "AND (:username IS NULL OR t.createdBy.username = :username) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount)")
    Page<Transaction> findFiltered(
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("username") String username,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount,
            Pageable pageable
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.isDeleted = false AND t.type = :type " +
           "AND (:dateFrom IS NULL OR t.date >= :dateFrom) " +
           "AND (:dateTo IS NULL OR t.date <= :dateTo) " +
           "AND (:username IS NULL OR t.createdBy.username = :username) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount)")
    BigDecimal sumAmountByTypeFiltered(
            @Param("type") String type,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("username") String username,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.isDeleted = false AND t.type = :type " +
           "AND (:dateFrom IS NULL OR t.date >= :dateFrom) " +
           "AND (:dateTo IS NULL OR t.date <= :dateTo) " +
           "AND (:username IS NULL OR t.createdBy.username = :username) " +
           "AND (:minAmount IS NULL OR t.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR t.amount <= :maxAmount) " +
           "GROUP BY t.category")
    List<Object[]> sumAmountByCategoryAndTypeFiltered(
            @Param("type") String type,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("username") String username,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );

    @Query("SELECT DISTINCT t.createdBy.username FROM Transaction t WHERE t.isDeleted = false ORDER BY t.createdBy.username")
    List<String> findDistinctCreatedByUsernames();
}


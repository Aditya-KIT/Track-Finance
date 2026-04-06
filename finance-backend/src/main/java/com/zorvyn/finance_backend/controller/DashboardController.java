package com.zorvyn.finance_backend.controller;

import com.zorvyn.finance_backend.dto.DashboardStatsResponse;
import com.zorvyn.finance_backend.entity.Transaction;
import com.zorvyn.finance_backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST') or hasRole('VIEWER')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {

        boolean hasFilter = dateFrom != null || dateTo != null || username != null
                || minAmount != null || maxAmount != null;

        if (hasFilter) {
            return ResponseEntity.ok(dashboardService.getFilteredDashboardStats(
                    dateFrom, dateTo, username, minAmount, maxAmount));
        }
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @GetMapping("/recent-transactions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST') or hasRole('VIEWER')")
    public ResponseEntity<List<Transaction>> getRecentTransactions() {
        return ResponseEntity.ok(dashboardService.getRecentTransactions());
    }
}


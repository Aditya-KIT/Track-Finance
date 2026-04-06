package com.zorvyn.finance_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardStatsResponse {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private Map<String, BigDecimal> categoryWiseIncome;
    private Map<String, BigDecimal> categoryWiseExpense;
    private List<Map<String, Object>> monthlyTrends;
}

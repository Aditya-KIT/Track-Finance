package com.zorvyn.finance_backend.service;

import com.zorvyn.finance_backend.dto.DashboardStatsResponse;
import com.zorvyn.finance_backend.entity.Transaction;
import com.zorvyn.finance_backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse response = new DashboardStatsResponse();

        BigDecimal income = transactionRepository.sumAmountByType("INCOME");
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal expense = transactionRepository.sumAmountByType("EXPENSE");
        if (expense == null) expense = BigDecimal.ZERO;

        response.setTotalIncome(income);
        response.setTotalExpense(expense);
        response.setNetBalance(income.subtract(expense));

        response.setCategoryWiseIncome(getCategoryData("INCOME"));
        response.setCategoryWiseExpense(getCategoryData("EXPENSE"));

        List<Object[]> trendsRaw = transactionRepository.getMonthlyTrends();
        List<Map<String, Object>> trends = trendsRaw.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("month", obj[0]);
            map.put("amount", obj[1]);
            return map;
        }).collect(Collectors.toList());

        response.setMonthlyTrends(trends);

        return response;
    }

    public DashboardStatsResponse getFilteredDashboardStats(
            LocalDate dateFrom, LocalDate dateTo, String username,
            BigDecimal minAmount, BigDecimal maxAmount) {

        DashboardStatsResponse response = new DashboardStatsResponse();

        BigDecimal income = transactionRepository.sumAmountByTypeFiltered(
                "INCOME", dateFrom, dateTo, username, minAmount, maxAmount);
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal expense = transactionRepository.sumAmountByTypeFiltered(
                "EXPENSE", dateFrom, dateTo, username, minAmount, maxAmount);
        if (expense == null) expense = BigDecimal.ZERO;

        response.setTotalIncome(income);
        response.setTotalExpense(expense);
        response.setNetBalance(income.subtract(expense));

        response.setCategoryWiseIncome(getCategoryDataFiltered("INCOME", dateFrom, dateTo, username, minAmount, maxAmount));
        response.setCategoryWiseExpense(getCategoryDataFiltered("EXPENSE", dateFrom, dateTo, username, minAmount, maxAmount));

        // Monthly trends are not filtered (kept as full-year overview)
        List<Object[]> trendsRaw = transactionRepository.getMonthlyTrends();
        List<Map<String, Object>> trends = trendsRaw.stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("month", obj[0]);
            map.put("amount", obj[1]);
            return map;
        }).collect(Collectors.toList());
        response.setMonthlyTrends(trends);

        return response;
    }

    public List<Transaction> getRecentTransactions() {
        return transactionRepository.findTop5ByIsDeletedFalseOrderByDateDesc();
    }

    private Map<String, BigDecimal> getCategoryData(String type) {
        List<Object[]> raw = transactionRepository.sumAmountByCategoryAndType(type);
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] obj : raw) {
            map.put((String) obj[0], (BigDecimal) obj[1]);
        }
        return map;
    }

    private Map<String, BigDecimal> getCategoryDataFiltered(
            String type, LocalDate dateFrom, LocalDate dateTo,
            String username, BigDecimal minAmount, BigDecimal maxAmount) {
        List<Object[]> raw = transactionRepository.sumAmountByCategoryAndTypeFiltered(
                type, dateFrom, dateTo, username, minAmount, maxAmount);
        Map<String, BigDecimal> map = new HashMap<>();
        for (Object[] obj : raw) {
            map.put((String) obj[0], (BigDecimal) obj[1]);
        }
        return map;
    }
}


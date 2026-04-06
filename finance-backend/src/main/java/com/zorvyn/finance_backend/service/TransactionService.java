package com.zorvyn.finance_backend.service;

import com.zorvyn.finance_backend.dto.TransactionRequest;
import com.zorvyn.finance_backend.entity.Transaction;
import com.zorvyn.finance_backend.entity.User;
import com.zorvyn.finance_backend.repository.TransactionRepository;
import com.zorvyn.finance_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Transaction createTransaction(TransactionRequest request) {
        Transaction transaction = new Transaction();
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType().toUpperCase());
        transaction.setCategory(request.getCategory());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setCreatedBy(getCurrentUser());

        return transactionRepository.save(transaction);
    }

    public Page<Transaction> getAllTransactions(Pageable pageable) {
        return transactionRepository.findByIsDeletedFalse(pageable);
    }

    public Page<Transaction> getFilteredTransactions(
            LocalDate dateFrom, LocalDate dateTo,
            String username, BigDecimal minAmount, BigDecimal maxAmount,
            Pageable pageable) {
        return transactionRepository.findFiltered(dateFrom, dateTo, username, minAmount, maxAmount, pageable);
    }

    public List<String> getDistinctCreatedByUsernames() {
        return transactionRepository.findDistinctCreatedByUsernames();
    }

    public Transaction updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (transaction.isDeleted()) {
            throw new RuntimeException("Transaction is deleted");
        }

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType().toUpperCase());
        transaction.setCategory(request.getCategory());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        transaction.setDeleted(true);
        transactionRepository.save(transaction);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }
}


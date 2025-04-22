package com.leavemanagement.dtos;

import lombok.Data;

@Data
public class LeaveBalanceDTO {
    private double currentBalance;
    private double carryOverBalance;
    private double totalBalance;
    private double monthlyAccrual;
    private int maxCarryOverDays;
}

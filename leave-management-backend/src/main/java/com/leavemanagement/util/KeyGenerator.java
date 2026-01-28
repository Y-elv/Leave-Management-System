package com.leavemanagement.util;

import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Base64;

/**
 * Generates a secure 256-bit JWT secret for HS256.
 * Run this class's main() and copy the printed value into .env as JWT_SECRET
 * (or into application.properties as jwt.secret).
 */
public class KeyGenerator {

    public static void main(String[] args) {
        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        System.out.println("Copy this value into application.properties as JWT_SECRET (or .env):");
        System.out.println(base64Key);
        System.out.println();
        System.out.println("Example .env:");
        System.out.println("JWT_SECRET=" + base64Key);
        System.out.println();
        System.out.println("Example application.properties (if not using env):");
        System.out.println("jwt.secret=" + base64Key);
    }
}

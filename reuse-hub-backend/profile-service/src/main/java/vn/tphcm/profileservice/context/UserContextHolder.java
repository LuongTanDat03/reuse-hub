/*
 * @ (#) UserContextHolder.java       1.0     9/2/2025
 *
 * Copyright (c) 2025. All rights reserved.
 */

package vn.tphcm.profileservice.context;
/*
 * @author: Luong Tan Dat
 * @date: 9/2/2025
 */

import java.util.Collections;
import java.util.List;

public class UserContextHolder {
    private static final ThreadLocal<UserContext> contextHolder = new ThreadLocal<>();

    public static void setContext(UserContext context) {
        contextHolder.set(context);
    }

    public static UserContext getContext() {
        return contextHolder.get();
    }

    public static void clear() {
        contextHolder.remove();
    }

    public static String getCurrentUserId() {
        UserContext context = getContext();
        return context != null ? context.getUserId() : null;
    }

    public static String getCurrentUsername() {
        UserContext context = getContext();
        return context != null ? context.getUsername() : null;
    }

    public static List<String> getCurrentUserRoles() {
        UserContext context = getContext();
        return context != null ? context.getRoles() : Collections.emptyList();
    }
}


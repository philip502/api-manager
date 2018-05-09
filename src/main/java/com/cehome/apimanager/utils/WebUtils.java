package com.cehome.apimanager.utils;

import com.cehome.apimanager.model.po.AmUser;

import javax.servlet.http.HttpSession;

public class WebUtils {

    public static boolean isLogin(HttpSession session) {
        return session.getAttribute(BaseVar.SESSION_LOGIN_USER) != null;
    }

    public static void setLoginManager(HttpSession session, AmUser o) {
        session.setAttribute(BaseVar.SESSION_LOGIN_USER, o);
    }

    public static AmUser getLoginManager(HttpSession session) {
        return (AmUser)session.getAttribute(BaseVar.SESSION_LOGIN_USER);
    }

    public static void removeLoginManager(HttpSession session) {
        session.removeAttribute(BaseVar.SESSION_LOGIN_USER);
    }

    interface BaseVar {
        String SESSION_LOGIN_USER = "loginUser";
    }
}

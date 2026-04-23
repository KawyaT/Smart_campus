package com.smartcampus.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Sends users back to the React app instead of Spring's default OAuth error page.
 * "Invalid credentials" on that page almost always means wrong Client ID/Secret or redirect URI.
 */
@Component
@Slf4j
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final String USER_HINT =
            "Google sign-in failed. In Google Cloud, set redirect URI to http://localhost:8081/login/oauth2/code/google. "
                    + "In smart-campus-api/.env set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (real values, not changeme). "
                    + "Restart the API.";

    @Value("${app.oauth2.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception) throws IOException {

        log.error("OAuth2 login failed: {}", exception.getMessage(), exception);
        if (exception instanceof OAuth2AuthenticationException oauth2Ex && oauth2Ex.getError() != null) {
            log.error("OAuth2 error code={}, description={}",
                    oauth2Ex.getError().getErrorCode(),
                    oauth2Ex.getError().getDescription());
        }

        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String redirect = base + "/login?oauth_error=" + URLEncoder.encode(USER_HINT, StandardCharsets.UTF_8);
        response.sendRedirect(redirect);
    }
}

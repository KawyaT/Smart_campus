package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * After Google OIDC: upsert user, issue same JWT as password login, redirect to SPA
 * {@code /oauth-success?token=...} (query param is URL-encoded by Spring so JWT '+' is safe).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Value("${app.oauth2.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String email = oauth2User.getAttribute("email");
        if ((email == null || email.isBlank()) && oauth2User instanceof OidcUser ou) {
            email = ou.getEmail();
        }
        if (email == null || email.isBlank()) {
            email = oauth2User.getName();
        }
        log.info("OAuth2 success for email={}", email);

        String name = oauth2User.getAttribute("name");
        User user = userService.upsertGoogleUser(email, name);
        log.info("Mongo user id={}, role={}, provider={}", user.getId(), user.getRole(), user.getAuthProvider());

        String token = jwtService.generateToken(user);

        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String redirectUrl = UriComponentsBuilder.fromUriString(base)
                .path("/oauth-success")
                .queryParam("token", token)
                .build()
                .encode(StandardCharsets.UTF_8)
                .toUriString();

        log.debug("Redirecting to frontend oauth-success (token omitted)");
        response.sendRedirect(redirectUrl);
    }
}

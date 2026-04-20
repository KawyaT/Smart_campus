package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Google uses OpenID Connect when scope includes {@code openid}. Spring calls {@link OidcUserService},
 * not {@code OAuth2UserService}. We upsert the campus user and return an {@link OidcUser} whose
 * {@linkplain OidcUser#getName() name} is the email (not {@code sub}) so the rest of the app stays consistent.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOidcUserService extends OidcUserService {

    private final UserService userService;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser oidcUser = super.loadUser(userRequest);
        if (log.isDebugEnabled()) {
            log.debug("Google OIDC attributes: {}", oidcUser.getAttributes());
        }
        String email = oidcUser.getEmail();
        if (email == null || email.isBlank()) {
            email = oidcUser.getAttribute("email");
        }
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("email_missing", "Google did not return an email", null));
        }
        String name = oidcUser.getAttribute("name");
        User user = userService.upsertGoogleUser(email, name);
        return new DefaultOidcUser(
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        );
    }
}

package com.smartcampus.repository.auth;

import com.smartcampus.model.auth.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository("authUserRepository")
public interface AuthUserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    
    List<User> findByRole(User.UserRole role);
    
    List<User> findByStatus(User.UserStatus status);
    
    List<User> findByDepartment(String department);
    
    @Query("{ 'firstName' : { $regex: ?0, $options: 'i' } }")
    List<User> searchByFirstName(String firstName);
    
    @Query("{ $or: [ { 'firstName' : { $regex: ?0, $options: 'i' } }, { 'lastName' : { $regex: ?0, $options: 'i' } }, { 'email' : { $regex: ?0, $options: 'i' } } ] }")
    List<User> searchUsers(String query);
}

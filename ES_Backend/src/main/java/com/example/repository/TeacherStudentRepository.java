package com.example.repository;

import com.example.entity.TeacherStudentMapping;
import com.example.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherStudentRepository
        extends JpaRepository<TeacherStudentMapping, Long> {

    // Get all students mapped to a teacher
    List<TeacherStudentMapping> findByTeacher(User teacher);

    // Get mapping for a specific student
    Optional<TeacherStudentMapping> findByStudent(User student);

    // Check if mapping exists
    boolean existsByTeacherAndStudent(User teacher, User student);
}
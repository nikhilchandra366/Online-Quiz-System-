
package com.quizplatform;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Id;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.*;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.*;
import javax.servlet.*;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.*;
import java.time.LocalDateTime;

//@SpringBootApplication // Commented to prevent execution
//@EnableMethodSecurity
public class QuizPlatformApplication {
    //public static void main(String[] args) {
    //    SpringApplication.run(QuizPlatformApplication.class, args);
    //}

    //@Bean
    //public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
    //    return http.csrf().disable()
    //            .authorizeHttpRequests(auth -> auth.requestMatchers("/auth/**").permitAll().anyRequest().authenticated())
    //            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
    //            .build();
    //}
}

// ========== Models ==========

@Document("users")
@Data @AllArgsConstructor @NoArgsConstructor
class User {
    @Id
    private String id;
    private String email;
    private String password;
    private String role;
}

@Document("quizzes")
@Data @AllArgsConstructor @NoArgsConstructor
class Quiz {
    @Id
    private String id;
    private String code;
    private String title;
    private String teacherEmail;
    private boolean isPublic;
    private int timeLimitMinutes;
    private int passingScore;
    private List<Question> questions = new ArrayList<>();
}

@Data @AllArgsConstructor @NoArgsConstructor
class Question {
    private String questionText;
    private List<String> options = new ArrayList<>();
    private int correctIndex;
}

@Document("submissions")
@Data @AllArgsConstructor @NoArgsConstructor
class Submission {
    @Id
    private String id;
    private String quizCode;
    private String studentEmail;
    private Map<Integer, Integer> submittedAnswers = new HashMap<>(); // <questionIndex, selectedOption>
    private int score;
    private int total;
    private boolean passed;
    private LocalDateTime timestamp;
}

// ========== Repositories ==========

interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}

interface QuizRepository extends MongoRepository<Quiz, String> {
    Optional<Quiz> findByCode(String code);
}

interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByQuizCode(String code);
    List<Submission> findByStudentEmail(String email);
}

// ========== JWT Utils (Mocked for Simplicity) ==========

@Component
class JwtUtil {
    public String generate(String email, String role) {
        return Base64.getEncoder().encodeToString((email + ":" + role).getBytes());
    }

    public String extractEmail(String token) {
        return new String(Base64.getDecoder().decode(token)).split(":")[0];
    }

    public String extractRole(String token) {
        return new String(Base64.getDecoder().decode(token)).split(":")[1];
    }

    public boolean validate(String token) {
        return token.contains(":");
    }
}

// ========== JWT Filter ==========

@Component
@RequiredArgsConstructor
class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtUtil.validate(token)) {
                String email = jwtUtil.extractEmail(token);
                String role = jwtUtil.extractRole(token);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority(role)));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }
}

// ========== Controllers ==========

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
class AuthController {
    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        user.setRole("ROLE_STUDENT");
        userRepo.save(user);
        return "Registered";
    }

    @PostMapping("/login")
    public String login(@RequestBody User login) {
        User user = userRepo.findByEmail(login.getEmail()).orElseThrow();
        if (user.getPassword().equals(login.getPassword())) {
            return jwtUtil.generate(user.getEmail(), user.getRole());
        }
        throw new RuntimeException("Invalid credentials");
    }
}

@RestController
@RequestMapping("/quiz")
@RequiredArgsConstructor
class QuizController {
    private final QuizRepository quizRepo;
    private final SubmissionRepository submissionRepo;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public Quiz createQuiz(@RequestBody Quiz quiz, @RequestHeader("Authorization") String auth) {
        String email = jwtUtil.extractEmail(auth.substring(7));
        quiz.setTeacherEmail(email);
        quiz.setCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        return quizRepo.save(quiz);
    }

    @GetMapping("/{code}")
    public Quiz getQuiz(@PathVariable String code) {
        return quizRepo.findByCode(code).orElseThrow();
    }

    @PostMapping("/{code}/submit")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public Submission submitQuiz(@PathVariable String code,
                                 @RequestBody Map<Integer, Integer> submittedAnswers,
                                 @RequestHeader("Authorization") String auth) {
        Quiz quiz = quizRepo.findByCode(code).orElseThrow();
        String email = jwtUtil.extractEmail(auth.substring(7));

        int score = 0;
        for (int i = 0; i < quiz.getQuestions().size(); i++) {
            int correct = quiz.getQuestions().get(i).getCorrectIndex();
            if (submittedAnswers.getOrDefault(i, -1) == correct) score++;
        }

        Submission sub = new Submission(null, code, email, submittedAnswers, score,
                quiz.getQuestions().size(), score >= quiz.getPassingScore(), LocalDateTime.now());
        return submissionRepo.save(sub);
    }

    @GetMapping("/{code}/results")
    @PreAuthorize("hasAuthority('ROLE_TEACHER')")
    public List<Submission> getResults(@PathVariable String code) {
        return submissionRepo.findByQuizCode(code);
    }
}

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
class StudentController {
    private final SubmissionRepository submissionRepo;
    private final JwtUtil jwtUtil;

    @GetMapping("/progress")
    @PreAuthorize("hasAuthority('ROLE_STUDENT')")
    public List<Submission> getProgress(@RequestHeader("Authorization") String auth) {
        String email = jwtUtil.extractEmail(auth.substring(7));
        return submissionRepo.findByStudentEmail(email);
    }
}

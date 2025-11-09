// package com.example.cinema.scheduler;
// import com.example.cinema.repository.MovieRepository;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import java.time.LocalDateTime;
// @Component
// public class MovieStatusScheduler {
    
//     private final MovieRepository movieRepo;
//     public MovieStatusScheduler(MovieRepository movieRepo){
//         this.movieRepo = movieRepo;
//     }

//     @Scheduled(cron = "0 0 3 * * *")

//     // Dùng tạm khi test: chạy mỗi 1 phút
//     @Scheduled(cron = "0 */1 * * * *")
//     public void runUpdate() {
//         movieRepo.updateComingSoon();
//         movieRepo.updateNowShowing();
//         System.out.println("Movie statuses updated successfully!");
//     }
// }

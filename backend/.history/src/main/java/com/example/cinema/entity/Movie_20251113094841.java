package com.example.cinema.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
@Entity
@Table(name="movie")
public class Movie {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name="movie_id", nullable = false)
    private Long id;
    
    @Column(nullable = false)
    private String title;

    @Column(name="poster_url", nullable = false)
    private String posterUrl;

    @Column(name="rating")
    private Double rating;

    @Column(name="synopsis", nullable = false)
    private String synopsis;

    @Column(name="duration_min")
    private Integer durationMin ;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name="active")
    private boolean active = true;

    public enum MovieStatus {
        now ,
        soon ,
    }
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovieStatus status = MovieStatus.soon;
    
    @Column(name="age_limit")
    private String rated ;
    
    @Column(name="language", nullable = false)
    private String language;

    @Column(name="end_showing_date")
    private LocalDate endShowingDate;

    @Column(name="early_screening_date")
    private LocalDate earlyScreeningDate;

    @Column(name="")
    private String backdropUrl;


    public Movie(){};
    // getter and setter

    public Long getId(){
        return this.id ;
    }
    public void setId(Long id){
        this.id = id;
    }
    public String getTitle(){
        return this.title;
    }
    public void setTitle(String title){
        this.title = title;
    }
    public String getPosterUrl(){
        return this.posterUrl;
    }
    public void setPosterUrl(String posterUrl){
        this.posterUrl = posterUrl;
    }
    public String getSynopsis(){
        return this.synopsis;
    }
    public void setSynopsis(String synopsis){
        this.synopsis = synopsis;
    }
    public String getTrailerUrl(){
        return this.trailerUrl;
    }
    public void setGetTrailerUrl(String trailer){
        this.trailerUrl = trailer;
    }
    public LocalDate getReleaseDate(){
        return this.releaseDate;
    }
    public void setReleaseDate(LocalDate rd){
        this.releaseDate = rd;
    }
    public MovieStatus getStatus(){
        return this.status;
    }
    public void setStatus(MovieStatus status){
        this.status = status;
    }
    public Integer getDurationMin(){
        return this.durationMin;
    }
    public void setDurationMin(Integer drm){
        this.durationMin = drm;
    }
    public Double getRating(){
        return this.rating;
    }
    public void setRating(Double rating){
        this.rating = rating;
    }
    public boolean isActive(){
        return active;
    }
    public void setActive(boolean active){
        this.active = active ;
    }
    public String getLanguage(){
        return language;
    }
    public void setLanguage(String language){
        this.language = language;
    }
    public String getRated(){
        return rated;
    }
    public void setRated(String rated){
        this.rated = rated;
    }

    public LocalDate getEndShowingDate(){return endShowingDate;}
    public void setEndShowingDate(LocalDate endShowingDate){this.endShowingDate = endShowingDate;}

    public LocalDate getEarlyScreeningDate(){return earlyScreeningDate;}
    public void setEarlyScreeningDate(LocalDate earlyScreeningDate){this.earlyScreeningDate=earlyScreeningDate;}

    public String getBackDropUrl(){return backdropUrl;}
    public void setBackDropUrl(String backdropUrl){this.backdropUrl = backdropUrl;}
}

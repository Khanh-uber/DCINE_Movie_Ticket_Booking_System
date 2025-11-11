package com.example.cinema.entity;
import jakarta.persistence.*;

@Entity
@Table(name="genre")
public class Genre {
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name="genre_id")
    private Long genreId;

    @Column(name="name")
    private String name;

    public Genre(){}
    public Genre(String name){
        this.name = name;
    }

    
    public Long getGenreId(){return genreId;}
    public void setGenreId(Long genreId){this.genreId = genreId;}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}
}

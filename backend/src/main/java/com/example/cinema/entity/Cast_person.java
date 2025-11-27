package com.example.cinema.entity;

import jakarta.persistence.*;

@Entity
@Table(name="cast_person")
public class Cast_person {
    
    @Id 
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name = "cast_id")
    private Long castId;

    @Column(name="name")
    private String name;

    @Column(name = "cast_url")
    private String castUrl;
    
    public enum Role {
        ACTOR,
        DIRECTOR
    }
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public Cast_person(){}

    public Cast_person(String name, Role role){
        this.name = name;
        this.role = role;
    }
    public Long getCastId(){return castId;}
    public void setCastId(Long castId){this.castId = castId;}

    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public Role getRole(){return role;}
    public void setRole(Role role){this.role = role;}

    public String getCastUrl() { return castUrl; }
    public void setCastUrl(String castUrl) { this.castUrl = castUrl; }

}

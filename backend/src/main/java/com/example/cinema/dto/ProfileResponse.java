package com.example.cinema.dto;

import java.util.List;


import lombok.Data;

@Data
public class ProfileResponse {
    private UserDTO user;
    private List<MembershipTierDTO> tiers;
    public ProfileResponse(){}
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public List<MembershipTierDTO> getTiers() { return tiers; }
    public void setTiers(List<MembershipTierDTO> tiers) { this.tiers = tiers; }


    public static class UserDTO {
        private Long id;
        private String fullName;
        private String username;
        private String email;
        private String phone;
        private String dob;
        private String gender;
        private String address;
        private String avatarUrl;
        private Long totalSpent;
        private String membership;
        private String joinedAt;

        public UserDTO(){}
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getDob() { return dob; }
        public void setDob(String dob) { this.dob = dob; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public Long getTotalSpent() { return totalSpent; }
        public void setTotalSpent(Long totalSpent) { this.totalSpent = totalSpent; }

        public String getMembership() { return membership; }
        public void setMembership(String membership) { this.membership = membership; }

        public String getJoinedAt() { return joinedAt; }
        public void setJoinedAt(String joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class MembershipTierDTO {
        private String name;
        private Long min;

        public MembershipTierDTO() {}
        public MembershipTierDTO(String name, Long min) {
            this.name = name;
            this.min = min;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Long getMin() { return min; }
        public void setMin(Long min) { this.min = min; }
    }
}


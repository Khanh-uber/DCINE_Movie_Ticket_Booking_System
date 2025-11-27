package com.example.cinema.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="concession_variant")
public class ConcessionVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "item_id")
    private Long itemId;

    private String label;
    private String value;

    @Column(name = "price_diff")
    private Double priceDiff;

    public ConcessionVariant() {}

    public ConcessionVariant(Long variantId, Long itemId, String label, String value, Double priceDiff) {
        this.variantId = variantId;
        this.itemId = itemId;
        this.label = label;
        this.value = value;
        this.priceDiff = priceDiff;
    }

    public Long getVariantId(){ return variantId; }
    public void setVariantId(Long variantId){ this.variantId = variantId; }

    public Long getItemId(){ return itemId; }
    public void setItemId(Long itemId){ this.itemId = itemId; }

    public String getLabel(){ return label; }
    public void setLabel(String label){ this.label = label; }

    public String getValue(){ return value; }
    public void setValue(String value){ this.value = value ; }

    public Double getPriceDiff(){ return priceDiff; }
    public void setPriceDiff(Double priceDiff){ this.priceDiff = priceDiff; }
}

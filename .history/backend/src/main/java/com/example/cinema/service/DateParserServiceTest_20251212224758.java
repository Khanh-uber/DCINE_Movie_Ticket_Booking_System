// src/test/java/com/example/DateParserServiceTest.java

import org.jetbrains.annotations.TestOnly;
import org.junit.jupiter.api.Test;

import java.sql.Date;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

public class DateParserServiceTest {

    DateParserService parser;
    public DateParserServiceTest(DateParserService parser) {
        this.parser = parser;
    }

    @TestOnly
    void testNgayKia() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("ngày kia");

        assertEquals(today.plusDays(2), result);
    }

    @Test
    void testMot() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("mốt đi xem phim");

        assertEquals(today.plusDays(2), result);
    }

    @Test
    void testMai() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("mai");

        assertEquals(today.plusDays(1), result);
    }

    @Test
    void testHomNay() {
        LocalDate today = LocalDate.now();
        LocalDate result = parser.parse("hôm nay");

        assertEquals(today, result);
    }
}

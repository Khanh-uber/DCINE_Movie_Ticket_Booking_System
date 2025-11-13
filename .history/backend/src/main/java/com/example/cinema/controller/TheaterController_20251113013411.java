@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "*")
public class TheaterController {

    @Autowired
    private TheaterService service;

    @GetMapping
    public List<TheaterDTO> getAll() {
        return service.getAll();
    }

    @GetMapping("/city/{city}")
    public List<TheaterDTO> getByCity(@PathVariable String city) {
        return service.getByCity(city);
    }

    @GetMapping("/{id}")
    public TheaterDTO getById(@PathVariable Long id) {
        return service.getById(id);
    }
}
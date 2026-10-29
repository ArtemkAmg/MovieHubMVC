using System.ComponentModel.DataAnnotations;

namespace MovieHubMvc.Models;

public sealed class MovieSuggestionViewModel
{
    [Display(Name = "Movie title")]
    public string? Title { get; set; }

    [Display(Name = "Director")]
    public string? Director { get; set; }

    [Display(Name = "Genre")]
    public string? Genre { get; set; }

    [Display(Name = "Release year")]
    public int? ReleaseYear { get; set; }

    [Display(Name = "Duration in minutes")]
    public int? DurationMinutes { get; set; }

    [Display(Name = "Rating from 0 to 10")]
    public decimal? Rating { get; set; }

    [Display(Name = "Country")]
    public string? Country { get; set; }

    [Display(Name = "Your email")]
    public string? ContactEmail { get; set; }

    [Display(Name = "Why do you recommend it")]
    public string? Description { get; set; }

    [Display(Name = "Have you watched it")]
    public bool? HasSeenIt { get; set; }
}

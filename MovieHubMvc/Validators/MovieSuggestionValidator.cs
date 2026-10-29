using FluentValidation;
using MovieHubMvc.Models;

namespace MovieHubMvc.Validators;

public sealed class MovieSuggestionValidator : AbstractValidator<MovieSuggestionViewModel>
{
    private static readonly string[] Genres =
    [
        "Action", "Animation", "Comedy", "Documentary", "Drama", "Sci-Fi", "Other"
    ];

    public MovieSuggestionValidator()
    {
        RuleFor(x => x.Title)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Enter a movie title.")
            .MinimumLength(2).WithMessage("The title must contain at least 2 characters.")
            .MaximumLength(120).WithMessage("The title cannot exceed 120 characters.");

        RuleFor(x => x.Director)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Enter the director's name.")
            .MaximumLength(80).WithMessage("The director's name cannot exceed 80 characters.");

        RuleFor(x => x.Genre)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Choose a genre.")
            .Must(genre => Genres.Contains(genre, StringComparer.Ordinal))
            .WithMessage("Choose a genre from the list.");

        RuleFor(x => x.ReleaseYear)
            .NotNull().WithMessage("Enter the release year.")
            .Must(year => !year.HasValue || year.Value is >= 1888 and <= 2100)
            .WithMessage("The release year must be between 1888 and 2100.");

        RuleFor(x => x.DurationMinutes)
            .NotNull().WithMessage("Enter the duration.")
            .Must(minutes => !minutes.HasValue || minutes.Value is >= 1 and <= 600)
            .WithMessage("The duration must be between 1 and 600 minutes.");

        RuleFor(x => x.Rating)
            .NotNull().WithMessage("Enter a rating.")
            .Must(rating => !rating.HasValue || rating.Value is >= 0 and <= 10)
            .WithMessage("The rating must be between 0 and 10.");

        RuleFor(x => x.Country)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Enter the country of production.")
            .MaximumLength(60).WithMessage("The country cannot exceed 60 characters.");

        RuleFor(x => x.ContactEmail)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Enter your email address.")
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(254).WithMessage("The email address cannot exceed 254 characters.");

        RuleFor(x => x.Description)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("Explain why you recommend this movie.")
            .MinimumLength(20).WithMessage("The description must contain at least 20 characters.")
            .MaximumLength(1000).WithMessage("The description cannot exceed 1000 characters.");

        RuleFor(x => x.HasSeenIt)
            .NotNull().WithMessage("Choose whether you have watched this movie.");
    }
}

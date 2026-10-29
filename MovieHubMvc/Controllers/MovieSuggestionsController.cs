using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using MovieHubMvc.Models;

namespace MovieHubMvc.Controllers;

public sealed class MovieSuggestionsController : Controller
{
    private readonly IValidator<MovieSuggestionViewModel> _validator;

    public MovieSuggestionsController(IValidator<MovieSuggestionViewModel> validator)
    {
        _validator = validator;
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View(new MovieSuggestionViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(
        MovieSuggestionViewModel model,
        CancellationToken cancellationToken)
    {
        var result = await _validator.ValidateAsync(model, cancellationToken);

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
        }

        if (!result.IsValid)
        {
            return View(model);
        }

        TempData["SuggestionSuccess"] = "Thanks! Your movie suggestion passed validation.";
        return RedirectToAction(nameof(Create));
    }
}

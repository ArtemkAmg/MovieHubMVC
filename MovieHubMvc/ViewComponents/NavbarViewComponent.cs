using Microsoft.AspNetCore.Mvc;

namespace MovieHubMvc.ViewComponents;

public sealed class NavbarViewComponent : ViewComponent
{
    public IViewComponentResult Invoke()
    {
        var controller = ViewContext.RouteData.Values["controller"]?.ToString();
        return View(model: controller);
    }
}

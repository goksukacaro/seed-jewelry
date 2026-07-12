import { expect, test } from "@playwright/test";

test("city seed recommendations update the map and waitlist copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Wear the future you want to grow." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Customize your piece" })).toBeVisible();
  await expect(page.locator("#piece").getByRole("heading", { name: "Customize your piece" })).toBeVisible();
  await expect(page.locator("#process").getByText("Select your preferred ring design, your bioregion, and seed type")).toBeVisible();
  await expect(page.getByText(/Your ring carries living seeds/)).toBeVisible();
  await expect(page.getByText(/our map recommends where to bury your piece/i)).toBeVisible();
  await expect(page.getByText("Material tone")).toHaveCount(0);
  await expect(page.getByText("Oat biocomposite")).toHaveCount(0);

  const configurator = page.locator("#piece");
  await page.getByLabel("Choose city").click();
  await page.getByRole("option", { name: /Istanbul/ }).click();
  await expect(configurator.locator(".region-note").getByText("Marmara transition zone")).toBeVisible();
  await expect(configurator.getByRole("button", { name: /Wild thyme/ })).toBeVisible();

  await configurator.getByRole("button", { name: /Meadow sage/ }).click();
  await expect(page.getByRole("heading", { name: /Where your piece belongs/i })).toBeVisible();
  await expect(page.getByText("Macka stair gardens")).toBeVisible();
  await expect(page.locator(".spot-best-match").filter({ hasText: "Meadow sage" }).first()).toBeVisible();

  await page.getByRole("button", { name: /Reef Bloom/ }).click();
  await expect(page.getByText("Selected design")).toBeVisible();
  await expect(configurator.getByText("Biocomposite").first()).toBeVisible();
  await expect(configurator.locator(".seed-flower-thumb")).toBeVisible();
  await expect(configurator.locator(".seed-flower-thumb img")).toHaveAttribute("src", /\/assets\/flowers\//);
});

test("revision copy is applied to the science section", async ({ page }) => {
  await page.goto("/#science");

  await expect(page.getByRole("heading", { name: "We collaborate with mother nature" })).toBeVisible();
  await expect(page.getByText(/Each Seed ring piece is cast from biocomposite materials/)).toBeVisible();
  await expect(page.getByText(/leaving the seeds to blossom/i)).toBeVisible();
});

test("selected seed flower thumbnail expands on hover and resets on mouseout", async ({ page }) => {
  await page.goto("/#piece");
  const thumb = page.locator(".seed-card.selected .seed-flower-thumb");
  await expect(thumb).toBeVisible();

  const initialBox = await thumb.boundingBox();
  expect(initialBox).not.toBeNull();

  await thumb.hover();
  await expect(thumb).toHaveCSS("opacity", "1");
  await expect.poll(async () => {
    const box = await thumb.boundingBox();
    return box ? box.width : 0;
  }).toBeGreaterThan(initialBox.width * 1.7);
  const expandedBox = await thumb.boundingBox();
  const labelBox = await page.locator(".seed-card.selected strong").boundingBox();
  expect(expandedBox).not.toBeNull();
  expect(labelBox).not.toBeNull();
  expect(expandedBox.x + expandedBox.width).toBeLessThanOrEqual(labelBox.x + 2);

  await page.mouse.move(20, 20);
  await expect.poll(async () => {
    const box = await thumb.boundingBox();
    return box ? box.width : 0;
  }).toBeLessThan(initialBox.width * 1.15);
});

test("layout remains fluid across supported viewport widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Viewport matrix only needs to run once.");

  const widths = [320, 360, 390, 430, 620, 768, 980, 1024, 1180, 1280, 1440];
  const sections = ["home", "process", "piece", "map", "science", "community", "waitlist"];

  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Wear the future you want to grow." })).toBeVisible();
    await expect(page.locator(".map-canvas")).toHaveAttribute("data-zoom-level", /\d+/);

    const scrollWidth = await page.evaluate(() => Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ));
    expect(scrollWidth, `no horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);

    await expect(page.locator(".site-header")).toBeVisible();
    await expect(page.locator(".site-footer")).toBeVisible();
    for (const sectionId of sections) {
      await expect(page.locator(`#${sectionId}`), `${sectionId} exists at ${width}px`).toBeVisible();
    }

    await page.locator("#map").scrollIntoViewIfNeeded();
    const mapCanvas = page.locator(".map-canvas");
    const beforeZoom = await mapCanvas.getAttribute("data-zoom-level");
    await page.locator(".leaflet-control-zoom-in").click();
    await expect.poll(() => mapCanvas.getAttribute("data-zoom-level")).not.toBe(beforeZoom);

    await page.locator("#waitlist").scrollIntoViewIfNeeded();
    await page.getByLabel("Email address").fill(`fluid-${width}@example.com`);
    await expect(page.getByLabel("Email address")).toHaveValue(`fluid-${width}@example.com`);
    await expect(page.getByRole("button", { name: "Join" })).toBeVisible();
  }
});

test("desktop map fills the full height of its layout row", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop two-column map layout only.");

  await page.setViewportSize({ width: 2048, height: 900 });
  await page.goto("/");
  await page.locator("#map").scrollIntoViewIfNeeded();

  const heights = await page.evaluate(() => {
    const layout = document.querySelector(".map-layout")?.getBoundingClientRect();
    const shell = document.querySelector(".map-shell")?.getBoundingClientRect();

    return {
      layout: Math.round(layout?.height ?? 0),
      shell: Math.round(shell?.height ?? 0),
    };
  });

  expect(heights.shell).toBeGreaterThanOrEqual(heights.layout - 2);
});

test("map filters and suggested spots sync with the map", async ({ page }) => {
  await page.goto("/#map");
  await expect(page.getByRole("heading", { name: /Where your piece belongs/i })).toBeVisible();
  const mapSection = page.locator("#map");

  await mapSection.getByRole("button", { name: "Common mallow 2 zones" }).click();
  await expect(mapSection.locator(".map-caption").getByText(/Common mallow density and recommended gaps/i)).toBeVisible();
  await expect(mapSection.getByRole("button", { name: "Common mallow 2 zones" })).toHaveAttribute("aria-pressed", "true");
  await mapSection.getByRole("button", { name: "Yarrow 2 zones" }).hover();
  await expect(mapSection.locator(".map-caption").getByText(/Common mallow density and recommended gaps/i)).toBeVisible();

  await mapSection.getByRole("button", { name: "Critical gap" }).click();
  await expect(mapSection.locator(".map-caption").getByText(/Filtered to critical gap/i)).toBeVisible();
  await expect(mapSection.getByRole("button", { name: "Critical gap" })).toHaveAttribute("aria-pressed", "true");

  await mapSection.getByRole("button", { name: /Kottbusser Tor tree pits/ }).click();
  await expect(mapSection.locator(".map-caption").getByText("Kottbusser Tor tree pits")).toBeVisible();
  await expect(page.locator(".spot-card.is-active")).toContainText("Kottbusser Tor tree pits");
  await expect(page.locator(".recommendation-marker.is-active")).toHaveCount(1);
});

test("mouse wheel over the map scrolls the page instead of zooming the map", async ({ page }) => {
  await page.goto("/#map");
  await expect(page.getByRole("heading", { name: /Where your piece belongs/i })).toBeVisible();

  const mapBox = await page.locator(".map-canvas").boundingBox();
  expect(mapBox).not.toBeNull();
  const before = await page.evaluate(() => window.scrollY);

  await page.mouse.move(mapBox.x + mapBox.width / 2, mapBox.y + mapBox.height / 2);
  await page.mouse.wheel(0, 700);

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(before + 100);
});

test("modifier wheel over the map zooms the map without scrolling the page", async ({ page }) => {
  await page.goto("/#map");
  await expect(page.getByRole("heading", { name: /Where your piece belongs/i })).toBeVisible();

  const mapCanvas = page.locator(".map-canvas");
  const mapBox = await mapCanvas.boundingBox();
  expect(mapBox).not.toBeNull();
  const beforeScroll = await page.evaluate(() => window.scrollY);
  const beforeZoom = await mapCanvas.getAttribute("data-zoom-level");

  await page.evaluate(() => {
    const map = document.querySelector(".map-canvas");
    map.dispatchEvent(new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      deltaY: -700,
    }));
  });

  await expect
    .poll(() => mapCanvas.getAttribute("data-zoom-level"))
    .not.toBe(beforeZoom);

  const afterScroll = await page.evaluate(() => window.scrollY);
  expect(Math.abs(afterScroll - beforeScroll)).toBeLessThan(20);
  await expect(page.getByText(/Hold Cmd\/Ctrl \+ scroll to zoom/i)).toBeVisible();
});

test("waitlist validation and local success work", async ({ page }) => {
  await page.goto("/#waitlist");

  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText("Enter a valid email")).toBeVisible();

  await page.getByLabel("Email address").fill("test@example.com");
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByText(/We will send/)).toBeVisible();
});

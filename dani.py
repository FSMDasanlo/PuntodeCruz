import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import ListedColormap
from matplotlib.patches import Patch

def generate_cowboy_hat_pattern():
    """
    Generates a 100x100 cross-stitch pattern of a cowboy hat,
    displays it on a precise 1mm/cell grid, and exports to PDF.
    """
    # Create the 100x100 grid initialized with 0 (Background / B5200)
    grid = np.zeros((100, 100), dtype=int)
   
    # Procedurally generate the cowboy hat shape
    for y in range(100):
        for x in range(100):
            # 1. Generate the Brim (Ellipse)
            if ((x - 50)**2 / 42**2) + ((y - 75)**2 / 12**2) <= 1:
                grid[y, x] = 3  # Medium Brown
                # Darker shadow underneath the brim
                if y > 77:
                    grid[y, x] = 2  # Dark Brown
                # Highlight on the outer edges
                if x < 15 or x > 85:
                    grid[y, x] = 4  # Light Brown
                   
            # 2. Generate the Crown (Rounded top rectangle)
            if 30 <= x <= 70 and 35 <= y <= 75:
                if y < 50:
                    # Rounded dome for the top of the crown
                    if ((x - 50)**2 / 20**2) + ((y - 50)**2 / 15**2) <= 1:
                        grid[y, x] = 3  # Medium Brown
                        # Light source from the top-left
                        if x < 45:
                            grid[y, x] = 4  # Light Brown
                        # Shadow on the right
                        elif x > 55:
                            grid[y, x] = 2  # Dark Brown
                else:
                    # Main body of the crown
                    grid[y, x] = 3  # Medium Brown
                    if x < 40:
                        grid[y, x] = 4  # Light Brown
                    elif x > 60:
                        grid[y, x] = 2  # Dark Brown

            # 3. Generate the Hat Band
            if 32 <= x <= 68 and 68 <= y <= 72:
                # Ensure it only overlays the crown area
                if grid[y, x] != 0:
                    grid[y, x] = 5  # Red

    # Map the integers to the specific DMC hex codes
    hex_colors = [
        '#FFFFFF',  # 0: DMC B5200 (Snow White)
        '#1E1108',  # 1: DMC 3371 (Black Brown) - Used for structural edges if expanded
        '#65371C',  # 2: DMC 801 (Coffee Brown Dark)
        '#7A4623',  # 3: DMC 433 (Brown Medium)
        '#9C5E31',  # 4: DMC 434 (Brown Light)
        '#C72B33'   # 5: DMC 321 (Red)
    ]
   
    color_names = [
        "DMC B5200 (Snow White)",
        "DMC 3371 (Black Brown)",
        "DMC 801 (Coffee Brown Dark)",
        "DMC 433 (Brown Medium)",
        "DMC 434 (Brown Light)",
        "DMC 321 (Red)"
    ]

    cmap = ListedColormap(hex_colors)

    # Set up the figure.
    # 100mm = 10cm = ~3.937 inches.
    # We make the figure wider to fit the legend, but lock the grid aspect ratio.
    fig, ax = plt.subplots(figsize=(8, 5))
   
    # Plot the matrix
    cax = ax.imshow(grid, cmap=cmap, vmin=0, vmax=5)

    # Configure axes to represent a 100x100 grid exactly
    ax.set_xticks(np.arange(-.5, 100, 1), minor=True)
    ax.set_yticks(np.arange(-.5, 100, 1), minor=True)
    ax.grid(which='minor', color='gray', linestyle='-', linewidth=0.5, alpha=0.5)
    ax.set_xticklabels([])
    ax.set_yticklabels([])
    ax.tick_params(which='both', length=0) # Hide tick marks
    ax.set_title("100x100 Cowboy Hat Pattern (1mm = 1 square)")

    # Create the legend
    legend_elements = [Patch(facecolor=hex_colors[i], edgecolor='black', label=color_names[i])
                       for i in range(len(hex_colors))]
    ax.legend(handles=legend_elements, loc='center left', bbox_to_anchor=(1.05, 0.5),
              title="DMC Color Palette", borderaxespad=0.)

    # Adjust layout to prevent clipping of the legend
    plt.tight_layout()

    # Save to high-resolution PDF
    output_filename = "cross_stitch_pattern.pdf"
    plt.savefig(output_filename, format='pdf', dpi=300, bbox_inches='tight')
    print(f"Successfully generated pattern and saved to '{output_filename}'")

if __name__ == "__main__":
    generate_cowboy_hat_pattern()
	
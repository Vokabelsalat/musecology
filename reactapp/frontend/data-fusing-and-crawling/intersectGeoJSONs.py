import geopandas as gpd
import json
from shapely.geometry import shape
from shapely.errors import TopologicalError

# Load the first geojson file
gdf1 = gpd.read_file('lv3.geojson')

gdf2 = gpd.read_file('un_map.geojson')

# # Load the second file as a JSON FeatureCollection
# with open('UN_Worldmap-2.json') as f:
#     data = json.load(f)

# # Convert JSON FeatureCollection to GeoDataFrame
# features = data['features']
# geometries = [shape(feature['geometry']) for feature in features]
# gdf2 = gpd.GeoDataFrame(features, geometry=geometries, crs=gdf1.crs)

# Ensure both GeoDataFrames have the same CRS
gdf2 = gdf2.to_crs(gdf1.crs)

# Attempt to fix invalid geometries in both GeoDataFrames
gdf1['geometry'] = gdf1['geometry'].apply(lambda geom: geom.buffer(0) if not geom.is_valid else geom)
gdf2['geometry'] = gdf2['geometry'].apply(lambda geom: geom.buffer(0) if not geom.is_valid else geom)

# Set the minimum overlap threshold (50%)
min_overlap_ratio = 0.05

# Create an empty list to store intersections
intersections = []

{"LEVEL3_NAM":"Germany","LEVEL3_COD":"GER","LEVEL2_COD":11,"LEVEL1_COD":1,"ISO3CD":"DEU","ROMNAM":"Germany"}

# Check for intersections with error handling and minimum overlap filter
for idx1, feature1 in gdf1.iterrows():
    for idx2, feature2 in gdf2.iterrows():
        # try:
        if feature1.geometry.intersects(feature2.geometry):
            intersection_geom = feature1.geometry.intersection(feature2.geometry)
            overlap_ratio = intersection_geom.area / feature1.geometry.area
            if feature2["ROMNAM"] == "Slovenia":
                print()
                print("HERE", overlap_ratio, feature1, feature2)
            if overlap_ratio >= min_overlap_ratio:
                intersections.append({
                    'file1_index': idx1,
                    'file2_index': idx2,
                    'props': {
                        "LEVEL3_NAM": feature1["LEVEL3_NAM"],
                        "LEVEL3_COD": feature1["LEVEL3_COD"],
                        "LEVEL2_COD": feature1["LEVEL2_COD"],
                        "LEVEL1_COD": feature1["LEVEL1_COD"],
                        "ISO3CD": feature2["ISO3CD"],
                        "ROMNAM": feature2["ROMNAM"],
                    },
                    'overlap_ratio': overlap_ratio,
                    'intersection_geom': intersection_geom
                })
        # except TopologicalError as e:
        #     print(f"Topology error between feature {idx1} and {idx2}: {e}")

# Convert intersections to GeoDataFrame
if intersections:
    intersect_gdf = gpd.GeoDataFrame(intersections, geometry='intersection_geom', crs=gdf1.crs)
    # Save the intersections to a new geojson file
    intersect_gdf.to_file('intersections.geojson', driver='GeoJSON')
    print("Intersections with at least 50% overlap saved to intersections.geojson")
else:
    print("No intersections found with the specified overlap threshold.")
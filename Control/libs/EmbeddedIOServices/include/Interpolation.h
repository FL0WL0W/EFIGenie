#include "math.h"
#include "stdint.h"

#ifndef INTERPOLATION_H
#define INTERPOLATION_H
namespace Interpolation
{
	struct InterpolationResponse
	{
		float Multiplier;
		uint8_t IndexL;
		uint8_t IndexH;
	};

	InterpolationResponse Interpolate(const float value, const float maxValue, const float minValue, const uint8_t resolution);
	
	template<typename K>
		K InterpolateTable1(const float value, const float maxValue, const float minValue, const uint8_t resolution, const K* table)
		{
			return InterpolateTable1<K>(Interpolate(value, maxValue, minValue, resolution), table);
		}
	
	template<typename K>
		K InterpolateTable1(const InterpolationResponse interpolation, const K* table)
		{
			if (static_cast<K>(0.5f) == 0)
			{
				return static_cast<K>(round(table[interpolation.IndexL] * (1 - interpolation.Multiplier) + table[interpolation.IndexH] * interpolation.Multiplier));
			}

			return static_cast<K>(table[interpolation.IndexL] * (1 - interpolation.Multiplier) + table[interpolation.IndexH] * interpolation.Multiplier);
		}
	
	template<typename K>
		K InterpolateTable2(const float valueX, const float maxValueX, const float minValueX, const uint8_t resolutionX, const float valueY, const float maxValueY, const float minValueY, const uint8_t resolutionY, const K* table)
		{
			return InterpolateTable2<K>(Interpolate(valueX, maxValueX, minValueX, resolutionX), resolutionX, Interpolate(valueY, maxValueY, minValueY, resolutionY), table);
		}
	
	template<typename K>
		K InterpolateTable2(const InterpolationResponse interpolationX, const uint8_t resolutionX, const InterpolationResponse interpolationY, const K* table)
		{
			if (static_cast<K>(0.5f) == 0)
			{
				return static_cast<K>(round(table[interpolationX.IndexL + resolutionX * interpolationY.IndexL] * (1 - interpolationX.Multiplier) * (1 - interpolationY.Multiplier)
				+							table[interpolationX.IndexH + resolutionX * interpolationY.IndexL] * interpolationX.Multiplier * (1 - interpolationY.Multiplier)
				+							table[interpolationX.IndexL + resolutionX * interpolationY.IndexH] * (1 - interpolationX.Multiplier) * interpolationY.Multiplier
				+							table[interpolationX.IndexH + resolutionX * interpolationY.IndexH] * interpolationX.Multiplier * interpolationY.Multiplier));
			}

			return	static_cast<K>(	table[interpolationX.IndexL + resolutionX * interpolationY.IndexL] * (1 - interpolationX.Multiplier) * (1 - interpolationY.Multiplier)
			+						table[interpolationX.IndexH + resolutionX * interpolationY.IndexL] * interpolationX.Multiplier * (1 - interpolationY.Multiplier)
			+						table[interpolationX.IndexL + resolutionX * interpolationY.IndexH] * (1 - interpolationX.Multiplier) * interpolationY.Multiplier
			+						table[interpolationX.IndexH + resolutionX * interpolationY.IndexH] * interpolationX.Multiplier * interpolationY.Multiplier);
		}
}
#endif

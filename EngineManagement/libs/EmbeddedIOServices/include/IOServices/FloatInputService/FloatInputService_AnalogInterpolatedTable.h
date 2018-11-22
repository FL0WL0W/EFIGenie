#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "math.h"
#include "Packed.h"
#include "Interpolation.h"

using namespace HardwareAbstraction;

#if !defined(FLOATINPUTSERVICE_ANALOGINTERPOLATEDTABLE_H) && defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATINPUTSERVICE_ANALOGINTERPOLATEDTABLE_H
namespace IOServices
{
	PACK(
	struct FloatInputService_AnalogInterpolatedTableConfig
	{
	private:
		FloatInputService_AnalogInterpolatedTableConfig()
		{
			
		}
		
	public:
		static FloatInputService_AnalogInterpolatedTableConfig* Cast(void *p)
		{
			FloatInputService_AnalogInterpolatedTableConfig *ret = (FloatInputService_AnalogInterpolatedTableConfig *)p;

			ret->Table = (float *)(ret + 1);

			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(FloatInputService_AnalogInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}
		
		unsigned char AdcPin;
		float MinInputValue;
		float MaxInputValue;
		unsigned short DotSampleRate;
		unsigned char Resolution;
		float *Table;
	});
	
	class FloatInputService_AnalogInterpolatedTable : public IFloatInputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatInputService_AnalogInterpolatedTableConfig *_config;
		
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
		
	public:
		FloatInputService_AnalogInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_AnalogInterpolatedTableConfig *config);

		void ReadValue();
	};
}
#endif
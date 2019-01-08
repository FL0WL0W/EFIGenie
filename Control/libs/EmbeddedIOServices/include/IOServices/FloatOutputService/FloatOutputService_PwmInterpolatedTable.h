#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H) && defined(IFLOATOUTPUTSERVICE_H)
#define FLOATOUTPUTSERVICE_PWMINTERPOLATEDTABLE_H
namespace IOServices
{
	PACK(
	struct FloatOutputService_PwmInterpolatedTableConfig
	{
	private:
		FloatOutputService_PwmInterpolatedTableConfig()
		{
			
		}
		
	public:
		static FloatOutputService_PwmInterpolatedTableConfig* Cast(void *p)
		{
			FloatOutputService_PwmInterpolatedTableConfig *ret = (FloatOutputService_PwmInterpolatedTableConfig *)p;

			ret->Table = (float *)(ret + 1);

			return ret;
		}
			
		unsigned int Size()
		{
			return sizeof(FloatOutputService_PwmInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}
		
		unsigned short PwmPin;
		unsigned short Frequency;
		float MinValue;
		float MaxValue;
		unsigned char Resolution;
		float *Table;
	});

	class FloatOutputService_PwmInterpolatedTable : public IFloatOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatOutputService_PwmInterpolatedTableConfig *_config;

	public:
		FloatOutputService_PwmInterpolatedTable(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_PwmInterpolatedTableConfig *config);
		
		void SetOutput(float value);
		void Calibrate();
	};
}
#endif
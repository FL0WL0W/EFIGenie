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
		unsigned int Size() const
		{
			return sizeof(FloatOutputService_PwmInterpolatedTableConfig) +
				(sizeof(float) * Resolution);
		}
		
		const float *Table() const { return (float *)(this + 1); }
		
		unsigned short PwmPin;
		unsigned short Frequency;
		float MinValue;
		float MaxValue;
		unsigned char Resolution;
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
#include "EngineControlServices/FuelConfig/IFuelConfig.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "Packed.h"

using namespace Reluctor;
using namespace IOServices;

#if !defined(FUELCONFIGWRAPPER_DFCO_H) && defined(IFUELCONFIG_H)
#define FUELCONFIGWRAPPER_DFCO_H
namespace EngineControlServices
{
	PACK(
	struct FuelConfigWrapper_DFCOConfig
	{
	private:
		FuelConfigWrapper_DFCOConfig()
		{

		}
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(FuelConfigWrapper_DFCOConfig);
		}

		float TpsThreshold;
		unsigned short RpmEnable;
		unsigned short RpmDisable;
	});

	class FuelConfigWrapper_DFCO : public IFuelConfig
	{
	protected:
		const FuelConfigWrapper_DFCOConfig *_config;
		IFloatInputService *_throttlePositionService;
		RpmService *_rpmService;
		IFuelConfig *_child;
		bool _dfcoEnabled;
	public:
		FuelConfigWrapper_DFCO(const FuelConfigWrapper_DFCOConfig *config, IFloatInputService *throttlePositionService, RpmService *rpmService, IFuelConfig *child);
		float GetFuelGrams(unsigned char injector);
	};
}
#endif
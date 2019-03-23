#include "EngineControlServices/FuelTrimService/IFuelTrimService.h"
#include "Packed.h"

#if !defined(FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H) && defined(IFUELTRIMSERVICE_H)
#define FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
namespace EngineControlServices
{
	PACK(
	struct FuelTrimServiceWrapper_MultiChannelConfig
	{
	private:
		FuelTrimServiceWrapper_MultiChannelConfig()
		{

		}
	public:
		const unsigned int Size() const
		{
			return sizeof(FuelTrimServiceWrapper_MultiChannelConfig) +
				sizeof(unsigned short) * NumberOfFuelTrimChannels;
		}
		const unsigned short *FuelTrimChannelMask() const { return (const unsigned short *)(this + 1); }
		unsigned char NumberOfFuelTrimChannels;
	});
	
	class FuelTrimServiceWrapper_MultiChannel : public IFuelTrimService
	{
	protected:
		const FuelTrimServiceWrapper_MultiChannelConfig *_config;
		
		IFuelTrimService **_fuelTrimChannels;
	public:
		FuelTrimServiceWrapper_MultiChannel(const FuelTrimServiceWrapper_MultiChannelConfig *config, IFuelTrimService **fuelTrimChannels);
		float GetFuelTrim(unsigned char cylinder);
		void Tick();
	};
}
#endif
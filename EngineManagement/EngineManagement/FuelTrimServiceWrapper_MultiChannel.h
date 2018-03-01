#if defined(IFuelTrimServiceExists)
#define FuelTrimServiceWrapper_MultiChannelExists
namespace EngineManagement
{
	class FuelTrimServiceWrapper_MultiChannel : public IFuelTrimService
	{
	protected:
		//settings
		unsigned char _numberOfFuelTrimChannels;
		IFuelTrimService **_fuelTrimChannels;
#if MAX_CYLINDERS <= 8
		unsigned char *_fuelTrimChannelMask;
#elif MAX_CYLINDERS <= 16
		unsigned short *_fuelTrimChannelMask;
#endif

	public:
		FuelTrimServiceWrapper_MultiChannel(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
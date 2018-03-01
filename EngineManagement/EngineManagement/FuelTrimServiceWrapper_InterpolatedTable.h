#if defined(ILambdaSensorServiceExists) && (defined(ITpsServiceExists) || defined(IMapServiceExists))
#define FuelTrimServiceWrapper_InterpolatedTableExists
namespace EngineManagement
{
	class FuelTrimServiceWrapper_InterpolatedTable : public IFuelTrimService
	{
	protected:
		//settings
		float _lambdaDeltaEnable;
		unsigned short _cycleDelay;
		unsigned short _dotRpmSampleRate;
		unsigned int _rpmDot;
		unsigned short _prevRpm;
		unsigned int _prevTick;
		unsigned char _rpmResolution;
		unsigned short *_rpmDivisions;
		unsigned short _rpmInterpolationDistance;
		unsigned char _yResolution;
		float *_yDivisions;
		float _yInterpolationDistance;
		unsigned char _fuelTrimChannels;
#if MAX_CYLINDERS <= 8
		unsigned char *_fuelTrimChannelAssignmentMask;
#elif MAX_CYLINDERS <= 16
		unsigned short *_fuelTrimChannelAssignmentMask;
#endif
		IFuelTrimService **_fuelTrimService;

		short *_fuelTrimTable;
		short *_fuelTrimChannel;
#if defined(ITpsServiceExists) && defined(IMapServiceExists)
		bool _useTps;
#endif
	public:
		FuelTrimServiceWrapper_InterpolatedTable(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
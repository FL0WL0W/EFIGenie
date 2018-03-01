#if defined(IFuelTrimServiceExists) && defined(ILambdaSensorServiceExists) && (defined(ITpsServiceExists) || defined(IMapServiceExists))
#define FuelTrimService_InterpolatedTableExists
namespace EngineManagement
{
	class FuelTrimService_InterpolatedTable : public IFuelTrimService
	{
	protected:
		//settings
		unsigned int _updateRate;
		unsigned short _cycleDelay;
		float _kP;
		float _kI;
		float _kD;
		ILambdaSensorService *_lambdaSensorService;
		bool _isPid;
		unsigned char _rpmResolution;
		unsigned short *_rpmDivisions;
		unsigned short _rpmInterpolationDistance;
		unsigned char _yResolution;
		float *_yDivisions;
		float _yInterpolationDistance;
		float _lambdaDeltaEnable;

		float _lastError;
		short *_fuelTrimIntegralTable;
		short _fuelTrim;
		unsigned int _rpmDot;
		unsigned short _prevRpm;
		unsigned int _prevTick;
#if defined(ITpsServiceExists) && defined(IMapServiceExists)
		bool _useTps;
#endif
	public:
		FuelTrimService_InterpolatedTable(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
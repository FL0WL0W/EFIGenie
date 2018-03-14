#if defined(IFuelTrimServiceExists)
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
		ISensorService *_lambdaSensorService;
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
		bool _useTps;
	public:
		FuelTrimService_InterpolatedTable(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
#if defined(IFuelTrimServiceExists)
#define FuelTrimService_InterpolatedTableExists
namespace EngineManagement
{

	struct __attribute__((__packed__)) FuelTrimService_InterpolatedTableConfig
	{
	private:
		FuelTrimService_InterpolatedTableConfig()
		{

		}
	public:
		static FuelTrimService_InterpolatedTableConfig* Cast(void *p)
		{
			FuelTrimService_InterpolatedTableConfig *ret = (FuelTrimService_InterpolatedTableConfig *)p;

			ret->RpmDivisions = (unsigned short *)(ret + 1);
			ret->YDivisions = (float *)(ret->RpmDivisions + ret->RpmResolution);

			return ret;
		}
		unsigned int UpdateRate;
		unsigned short CycleDelay;
		float P;
		float I;
		float D;
		unsigned char RpmResolution;
		unsigned short *RpmDivisions;
		unsigned short RpmInterpolationDistance;
		unsigned char YResolution;
		float *YDivisions;
		float YInterpolationDistance;
		bool IsPid;
		bool UseTps;
		float LambdaDeltaEnable;
	};

	class FuelTrimService_InterpolatedTable : public IFuelTrimService
	{
	protected:
		const FuelTrimService_InterpolatedTableConfig *_config;

		IFloatInputService *_lambdaSensorService;
		float _lastError;
		short *_fuelTrimIntegralTable;
		short _fuelTrim;
		unsigned int _rpmDot;
		unsigned short _prevRpm;
		unsigned int _prevTick;
	public:
		FuelTrimService_InterpolatedTable(const FuelTrimService_InterpolatedTableConfig *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
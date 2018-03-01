#if defined(IFuelTrimServiceExists) && defined(ILambdaSensorServiceExists) && defined(IAfrServiceExists)
#define FuelTrimService_PidExists
namespace EngineManagement
{
	class FuelTrimService_Pid : public IFuelTrimService
	{
	protected:
		//settings
		float _kP;
		float _kI;
		float _kD;
		float _lambdaDeltaEnable;
		unsigned int tickRate;
		ILambdaSensorService *_lambdaSensorService;

		unsigned int _lastTick;
		float _lastError;
		float _integral;
		short _fuelTrim;
	public:
		FuelTrimService_Pid(void *config);
		short GetFuelTrim(unsigned char cylinder);
		void TrimTick();
	};
}
#endif
namespace HardwareAbstraction
{
	class MockPwmService : public IPwmService
	{
	public:
		MOCK_METHOD2(InitPin, void(unsigned char, PinDirection));
		MOCK_METHOD1(ReadPin, PwmValue(unsigned char));
		MOCK_METHOD2(WritePin, void(unsigned char, PwmValue));
	};
}
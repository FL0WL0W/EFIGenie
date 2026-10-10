#include "CommunicationHandlers/CommunicationHandler_OBD2PIDRequester.h"
#include "CommunicationHandlers/CommunicationHandler_OBD2PIDResponder.h"
#include "CommunicationHandlers/CommunicationHandler_UDSDIDRequester.h"
#include "CommunicationHandlers/CommunicationHandler_UDSDIDResponder.h"
#include "Operations/Operation.h"

#include <gmock/gmock.h>
#include <gtest/gtest.h>
#include "MockCommunicationService.h"
#include <array>
#include <type_traits>
#include <vector>

namespace EFIGenie
{
namespace
{
	class MirrorWordOperation : public OperationArchitecture::Operation<uint16_t>
	{
	public:
		uint16_t Execute() override { ++calls; return 0x1234; }
		unsigned calls = 0;
	};

	class MirrorByteOperation : public OperationArchitecture::Operation<uint8_t>
	{
	public:
		uint8_t Execute() override { return 0x7f; }
	};

	class MirrorArrayOperation : public OperationArchitecture::Operation<std::array<uint8_t, 4>>
	{
	public:
		std::array<uint8_t, 4> Execute() override { return {{ 0x12, 0x34, 0x56, 0x78 }}; }
	};

	using Bytes = std::vector<uint8_t>;

	template<class Handler>
	Bytes Read(Handler &handler, const Bytes &request)
	{
		Bytes response;
		unsigned sends = 0;
		EXPECT_EQ(handler.Receive([&](const void *data, size_t size) {
			++sends;
			const auto *bytes = static_cast<const uint8_t *>(data);
			response.assign(bytes, bytes + size);
		}, request.data(), request.size()), request.size());
		EXPECT_EQ(sends, 1u);
		return response;
	}
}

	TEST(CommunicationHandler_DiagnosticMirrorTests, PIDAPIUsesEightBitIdentifiers)
	{
		static_assert(std::is_same<decltype(&CommunicationHandler_OBD2PIDRequester::RequestPID),
			bool (CommunicationHandler_OBD2PIDRequester::*)(uint8_t)>::value, "PID requests must be 8-bit");
		static_assert(std::is_same<decltype(&CommunicationHandler_OBD2PIDResponder::RegisterPID),
			bool (CommunicationHandler_OBD2PIDResponder::*)(uint8_t, OperationArchitecture::AbstractOperation *)>::value,
			"PID registrations must be 8-bit");
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, MirrorUsesConfiguredHighByteWithoutSendingOnPIDBus)
	{
		testing::StrictMock<EmbeddedIOServices::MockCommunicationService> pidBus;
		CommunicationHandler_OBD2PIDResponder pid(&pidBus);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorWordOperation word;
		ASSERT_TRUE(pid.RegisterPID(0x0c, &word));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xab, &pid));
		EXPECT_EQ(Read(did, { 0x22, 0xab, 0x0c }), (Bytes{ 0x62, 0xab, 0x0c, 0x12, 0x34 }));
		EXPECT_EQ(word.calls, 1u);
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
		EXPECT_EQ(Read(did, { 0x22, 0x00, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, MirrorForwardsLiveSupportedPIDBitmaps)
	{
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorByteOperation byte;
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		ASSERT_TRUE(pid.RegisterPID(0x01, &byte));
		ASSERT_TRUE(pid.RegisterPID(0x21, &byte));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x00 }), (Bytes{ 0x62, 0xf4, 0x00, 0x80, 0x00, 0x00, 0x01 }));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x20 }), (Bytes{ 0x62, 0xf4, 0x20, 0x80, 0x00, 0x00, 0x00 }));
		pid.UnregisterPID(0x21);
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x00 }), (Bytes{ 0x62, 0xf4, 0x00, 0x80, 0x00, 0x00, 0x00 }));
		ASSERT_TRUE(pid.RegisterPID(0xff, &byte));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0xe0 }), (Bytes{ 0x62, 0xf4, 0xe0, 0x00, 0x00, 0x00, 0x02 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, MixedMultiDIDRequestPreservesOrderAndPayloadBytes)
	{
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorArrayOperation array;
		MirrorByteOperation byte;
		ASSERT_TRUE(pid.RegisterPID(0x0c, &array));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		ASSERT_TRUE(did.RegisterDID(0x000c, &byte));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c, 0x00, 0x0c, 0xf4, 0x0c }),
			(Bytes{ 0x62, 0xf4, 0x0c, 0x12, 0x34, 0x56, 0x78, 0x00, 0x0c, 0x7f, 0xf4, 0x0c, 0x12, 0x34, 0x56, 0x78 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, DirectDIDOverridesMirrorUntilUnregistered)
	{
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorWordOperation word;
		MirrorByteOperation byte;
		ASSERT_TRUE(pid.RegisterPID(0x0c, &word));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		ASSERT_TRUE(did.RegisterDID(0xf40c, &byte));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x62, 0xf4, 0x0c, 0x7f }));
		EXPECT_EQ(word.calls, 0u);
		did.UnregisterDID(0xf40c);
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x62, 0xf4, 0x0c, 0x12, 0x34 }));
		did.UnregisterOBD2PIDMirror(0xf4);
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, MultipleMirrorsCanBeReplacedAndNullIsRejected)
	{
		CommunicationHandler_OBD2PIDResponder first(nullptr), second(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorWordOperation word;
		MirrorByteOperation byte;
		ASSERT_TRUE(first.RegisterPID(0x0c, &word));
		ASSERT_TRUE(second.RegisterPID(0x0c, &byte));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &first));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xaa, &second));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c, 0xaa, 0x0c }), (Bytes{ 0x62, 0xf4, 0x0c, 0x12, 0x34, 0xaa, 0x0c, 0x7f }));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &second));
		EXPECT_FALSE(did.RegisterOBD2PIDMirror(0xf4, nullptr));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x62, 0xf4, 0x0c, 0x7f }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, UnsupportedMirrorReturnsOnlyNegativeResponse)
	{
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		MirrorByteOperation byte;
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		ASSERT_TRUE(did.RegisterDID(0xf190, &byte));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
		EXPECT_EQ(Read(did, { 0x22, 0xf1, 0x90, 0xf4, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, InvalidPayloadAndRegistrationAreRejected)
	{
		class PointerOperation : public OperationArchitecture::Operation<void *>
		{
			void *Execute() override { return nullptr; }
		} pointer;
		class ParameterOperation : public OperationArchitecture::Operation<uint8_t, uint8_t>
		{
			uint8_t Execute(uint8_t v) override { return v; }
		} parameter;
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		EXPECT_FALSE(did.RegisterDID(0x1234, nullptr));
		EXPECT_FALSE(did.RegisterDID(0x1234, &parameter));
		ASSERT_TRUE(did.RegisterDID(0x1234, &pointer));
		EXPECT_EQ(Read(did, { 0x22, 0x12, 0x34 }), (Bytes{ 0x7f, 0x22, 0x31 }));
		ASSERT_TRUE(pid.RegisterPID(0x0c, &pointer));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		EXPECT_EQ(Read(did, { 0x22, 0xf4, 0x0c }), (Bytes{ 0x7f, 0x22, 0x31 }));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, MalformedFramedDIDRequestsReturnInvalidFormat)
	{
		CommunicationHandler_UDSDIDResponder did(nullptr);
		for(const auto &request : { Bytes{ 0x22 }, Bytes{ 0x22, 0xf4 }, Bytes{ 0x22, 0xf4, 0x0c, 0xf1 } })
			EXPECT_EQ(Read(did, request), (Bytes{ 0x7f, 0x22, 0x13 }));
		EXPECT_EQ(did.Receive({}, nullptr, 0), 0u);
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, PIDAndDIDHandlersCoexistOnSameBus)
	{
		testing::StrictMock<EmbeddedIOServices::MockCommunicationService> bus;
		CommunicationHandler_OBD2PIDResponder pid(&bus);
		CommunicationHandler_UDSDIDResponder did(&bus);
		MirrorWordOperation word;
		ASSERT_TRUE(pid.RegisterPID(0x0c, &word));
		ASSERT_TRUE(did.RegisterOBD2PIDMirror(0xf4, &pid));
		const uint8_t pidRequest[] = { 0x01, 0x0c };
		const uint8_t didRequest[] = { 0x22, 0xf4, 0x0c };
		EXPECT_CALL(bus, Send(testing::_, 4)).WillOnce([](const void *data, size_t size) {
			const auto *bytes = static_cast<const uint8_t *>(data);
			EXPECT_EQ(Bytes(bytes, bytes + size), (Bytes{ 0x41, 0x0c, 0x12, 0x34 }));
		});
		EXPECT_EQ(bus.Receive(pidRequest, sizeof(pidRequest)), sizeof(pidRequest));
		EXPECT_CALL(bus, Send(testing::_, 5)).WillOnce([](const void *data, size_t size) {
			const auto *bytes = static_cast<const uint8_t *>(data);
			EXPECT_EQ(Bytes(bytes, bytes + size), (Bytes{ 0x62, 0xf4, 0x0c, 0x12, 0x34 }));
		});
		EXPECT_EQ(bus.Receive(didRequest, sizeof(didRequest)), sizeof(didRequest));
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, RequestersKeepLowDIDsSeparateFromPIDs)
	{
		testing::StrictMock<EmbeddedIOServices::MockCommunicationService> bus;
		CommunicationHandler_OBD2PIDRequester pid(&bus);
		CommunicationHandler_UDSDIDRequester did(&bus);
		unsigned pidCalls = 0, didCalls = 0;
		pid.RegisterReceivedPID(0x0c, [&](const void *, size_t) { ++pidCalls; });
		const auto removed = did.RegisterReceivedDID(0x000c, [&](const void *, size_t) { ADD_FAILURE(); });
		did.UnregisterReceivedDID(removed);
		did.RegisterReceivedDID(0x000c, [&](const void *data, size_t length) {
			++didCalls;
			ASSERT_EQ(length, 2u);
			const auto *bytes = static_cast<const uint8_t *>(data);
			EXPECT_EQ(Bytes(bytes, bytes + length), (Bytes{ 0x12, 0x34 }));
		});
		EXPECT_CALL(bus, Send(testing::_, 3)).WillOnce([](const void *data, size_t size) {
			const auto *bytes = static_cast<const uint8_t *>(data);
			EXPECT_EQ(Bytes(bytes, bytes + size), (Bytes{ 0x22, 0x00, 0x0c }));
		});
		EXPECT_TRUE(did.RequestDID(0x000c));
		const uint8_t pidResponse[] = { 0x41, 0x0c, 0x12, 0x34 };
		const uint8_t didResponse[] = { 0x62, 0x00, 0x0c, 0x12, 0x34 };
		EXPECT_EQ(pid.Receive({}, didResponse, sizeof(didResponse)), 0u);
		EXPECT_EQ(did.Receive({}, pidResponse, sizeof(pidResponse)), 0u);
		EXPECT_EQ(bus.Receive(pidResponse, sizeof(pidResponse)), sizeof(pidResponse));
		EXPECT_EQ(bus.Receive(didResponse, sizeof(didResponse)), sizeof(didResponse));
		EXPECT_EQ(pidCalls, 1u);
		EXPECT_EQ(didCalls, 1u);
	}

	TEST(CommunicationHandler_DiagnosticMirrorTests, RespondersRejectOtherServiceAndRequestersNeedBus)
	{
		CommunicationHandler_OBD2PIDResponder pid(nullptr);
		CommunicationHandler_UDSDIDResponder did(nullptr);
		const uint8_t pidRequest[] = { 0x01, 0x0c };
		const uint8_t didRequest[] = { 0x22, 0x00, 0x0c };
		EXPECT_EQ(pid.Receive({}, didRequest, sizeof(didRequest)), 0u);
		EXPECT_EQ(did.Receive({}, pidRequest, sizeof(pidRequest)), 0u);
		CommunicationHandler_OBD2PIDRequester pidRequester(nullptr);
		CommunicationHandler_UDSDIDRequester didRequester(nullptr);
		EXPECT_FALSE(pidRequester.RequestPID(0x0c));
		EXPECT_FALSE(didRequester.RequestDID(0xf40c));
	}
}
